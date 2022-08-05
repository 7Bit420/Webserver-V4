const ws = require('ws')
const http = require('http')
const https = require('https')
const fs = require('fs')
const cluster = require('cluster')?.default ?? require('cluster')
const os = require('os')
const EventEmitter = require('events')
const Logger = require('webserver-v4-logger').Logger
globalThis.logger = Logger.prototype

const httpServer = http.createServer(serverListner)
const wsServer = new ws.WebSocketServer({ server: httpServer })

globalThis.handlers = []
globalThis.wsHandlers = []

globalThis.config = process.env.config ?? {}
globalThis.spawnArgs = process.env.spawnArgs ?? []
globalThis.dirname = process.env.dirname ?? __dirname

globalThis.mime = []
globalThis.games = {}
globalThis.eventDistrubitor = new EventEmitter()

const ignoreList = []

for (let i of fs.readdirSync(`${__dirname}/handlers/`)) {
    if (!fs.lstatSync(`${__dirname}/handlers/${i}`).isFile()) continue;
    var handler = require(`${__dirname}/handlers/${i}`)
    if (handler.special) continue;

    handlers.push({
        path: handler.path,
        handler: handler.handler,
        module: handler
    })
}

for (let i of fs.readdirSync(`${__dirname}/ws-handlers/`)) {
    if (ignoreList.includes(i)) continue;
    if (!i.endsWith('.js')) continue;
    if (!fs.lstatSync(`${__dirname}/ws-handlers/${i}`).isFile()) continue;
    var handler = require(`${__dirname}/ws-handlers/${i}`)
    if (handler.special) continue;

    wsHandlers.push({
        path: handler.path,
        handler: handler.handler,
        module: handler,
        config: handler.config
    })
}

function serverListner(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype,
) {
    process.send({
        method: 'log',
        prams: ['normal', `A ${req.method} request from ${req.socket.remoteAddress} was made to ${req.url}`]
    });

    // res.setHeader('X-Note', 'Python Sucks');
    // res.setHeader('Link', `<https://localhost>; type="text/javascript"`);

    ; (
        handlers.find((t) => decodeURIComponent(req.url).startsWith(t.path))
        ?? require(`${__dirname}/handlers/deafult`)
    ).handler(req, res)
}


/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
function WSServerListner(
    client, req
) {
    process.send({
        method: 'log',
        prams: ['normal', `A Websocket request from ${req.socket.remoteAddress} was made to ${req.url}`]
    });

    ;(
        wsHandlers.find((t) => decodeURIComponent(req.url).startsWith(t.path))
        ?? require(`${__dirname}/ws-handlers/default`)
    ).handler(client, req)
}

wsServer.addListener('connection', WSServerListner)

if (cluster.isPrimary) {
    process.title = 'Webserver V4 Main Server'

    //#region wsClient
    globalThis.clid = "webserver"
    globalThis.client = new ws.WebSocket('ws://localhost:5200', {
        headers: {
            id: "webserver"
        },
        host: 'localhost',
        port: 5200,
        protocol: 'ws'
    })

    client.addEventListener('close', onDisconect)

    async function onDisconect() {
        process.stdout.write(JSON.stringify({
            type: "statusUpdate",
            body: {
                state: 500
            }
        }))
        reconect()
    }

    async function reconect() {
        while (client.readyState <= 2) {

            client = new ws.WebSocket('ws://localhost:5200', {
                headers: {
                    id: "webserver"
                },
                host: 'localhost',
                port: 5200,
                protocol: 'ws'
            })

            client.addEventListener('close', onDisconect);

            await new Promise((res, reg) => {
                setTimeout(res, 5000)
                client.addEventListener('close', res)
            })
        }

        process.stdout.write(JSON.stringify({
            type: "statusUpdate",
            body: {
                state: 200
            }
        }))
    }

    //#endregion

    //#region init

    var initI = false

    process.stdin.on('data', (data) => {
        try {
            data = JSON.parse(data.toString('ascii'))
        } catch (err) { return }

        switch (data.type) {
            case "setConfig":
                config = data.body.config
                spawnArgs = data.body.spawnArgs
                dirname = data.body.dirname

                cluster.settings.config = config
                cluster.settings.spawnArgs = spawnArgs
                cluster.settings.dirname = dirname

                globalThis.logger = new Logger(dirname + "/Logs/WebServer")

                if (!initI) init()
                break;
        }
    })

    function updateStatus(code) {
        process.stdout.write(JSON.stringify({
            type: "statusUpdate",
            body: {
                state: code
            }
        }))
    }

    function init() {

        spawnClusters();
        updateStatus(200)
        initI = !initI;
    }

    setTimeout(() => {
        process.stdout.write(JSON.stringify({
            type: "getConfig"
        }))
    }, 1000)

    //#endregion

    //#region cluster

    var clustersSpawned = false
    const clusters = new Map()

    cluster.on('fork', initProcess)

    function initProcess(process = cluster.worker) {
        process.addListener('online', () => {
            clusters.set(process.id, process)
            logger.logInfo(`Worker: ${process.process.pid} Connected`)
        })

        process.addListener('exit', () => {
            clusters.delete(process.id)
            cluster.fork()
            logger.logWarn(`Worker: ${process.process.pid} exited`)
        })

        process.on('error', (err) => {
            logger.logError(err)
        })

        process.on('disconnect', () => {
            logger.logWarn(`Worker: ${process.process.pid} disconnected`)
        })

        process.on('message', (msg) => {
            switch (msg.method) {
                case 'log':
                    switch (msg.prams[0]) {
                        case 'normal':
                            logger.log(msg.prams[1])
                            break;
                        case 'debug':
                            logger.logDebug(msg.prams[1])
                            break;
                        case 'error':
                            logger.logError(msg.prams[1])
                            break;
                        case 'info':
                            logger.logInfo(msg.prams[1])
                            break;
                        case 'warn':
                            logger.logWarn(msg.prams[1])
                            break;
                    }
                    break;
                case 'event':
                    for (var worker in cluster.workers) {
                        cluster.workers[worker].send(msg)
                    }
                    break;
            }
        })

        process.send(JSON.stringify({
            type: "updateConfig",
            body: {
                config: config,
                spawnArgs: spawnArgs,
                dirname: dirname
            }
        }))
    }

    function spawnClusters() {
        for (let i of os.cpus()) {
            cluster.fork({
                config: config,
                spawnArgs: spawnArgs,
                dirname: dirname,
            })
        }

        clustersSpawned = !clustersSpawned
    }

    //#endregion

    process.on('uncaughtException', logger.logError)
} else {
    process.title = 'Webserver V4 Fork #' + cluster.worker.id

    process.on('message', (msg)=>{

        switch (msg.method) {
            case 'event':
                eventDistrubitor.emit(...msg.prams)
                break;
        }
    })

    var httpsServer, wssServer
    //#region wsClient
    globalThis.clid = "webserver-" + cluster.worker.id
    globalThis.client = new ws.WebSocket('ws://localhost:5200', {
        headers: {
            id: "webserver-" + cluster.worker.id
        },
        host: 'localhost',
        port: 5200,
        protocol: 'ws'
    })

    client.addEventListener('close', onDisconect)

    async function onDisconect() {
        process.stdout.write(JSON.stringify({
            type: "statusUpdate",
            body: {
                state: 500
            }
        }))
        reconect()
    }

    async function reconect() {
        while (client.readyState <= 2) {

            client = new ws.WebSocket('ws://localhost:5200', {
                headers: {
                    id: "webserver-" + cluster.worker.id
                },
                host: 'localhost',
                port: 5200,
                protocol: 'ws'
            })

            client.addEventListener('close', onDisconect);

            await new Promise((res, reg) => {
                setTimeout(res, 5000)
                client.addEventListener('close', res)
            })
        }

        process.stdout.write(JSON.stringify({
            type: "statusUpdate",
            body: {
                state: 200
            }
        }))
    }

    //#endregion

    process.on('message', (message) => {
        try {
            message = JSON.parse(message.toString('ascii'))
        } catch (err) { return }

        switch (message.type) {
            case "updateConfig":
                globalThis.config = message.body.config
                globalThis.spawnArgs = message.body.spawnArgs
                globalThis.dirname = message.body.dirname

                globalThis.discordConfig = require(`${dirname}/Config/discord.json`)
                globalThis.mime = require(`${dirname}/Config/mime.json`)

                httpsServer?.close()
                httpsServer = https.createServer({
                    cert: fs.readFileSync(`${dirname}/Config/Certs/WebServer-cert.pem`),
                    key: fs.readFileSync(`${dirname}/Config/Certs/WebServer-key.pem`),
                }, serverListner)
                wssServer = new ws.WebSocketServer({
                    server: httpsServer
                });
                wssServer.on('connection', WSServerListner)

                httpsServer.listen(443)
                break;
        }

    })

    httpServer.listen(80);

    process.on('uncaughtException', console.warn)
}


