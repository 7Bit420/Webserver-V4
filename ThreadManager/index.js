const ws = require('ws')
const http = require('http')
const fs = require('fs')
const Logger = require('webserver-v4-logger').Logger
var logger = Logger.prototype

const httpServer = http.createServer()
const clients = []
const wsServer = new ws.Server({
    server: httpServer
})

var init = false;

//#region init

var config = {}
var spawnArgs = []
var dirname = __dirname

process.stdin.on('data', (data) => {
    try {
        data = JSON.parse(data.toString('ascii'))
    } catch (err) { return }

    switch (data.type) {
        case "setConfig":
            config = data.body.config
            spawnArgs = data.body.spawnArgs
            dirname = data.body.dirname

            logger = new Logger(dirname + "/Logs/ThreadManager")
            break;
    }
})

setTimeout(() => {
    process.stdout.write(JSON.stringify({
        type: "getConfig"
    }))
}, 1000)

//#endregion

// setInterval(() => process.stdout.write("ELLO"), 1000)

wsServer.on('connection', (client, req) => {
    const clientId = req.headers.id;
    if (!clientId) return client.close()
    if (clients.some(c => c.id == clientId)) { console.log(clientId, req.headers); return client.close() }

    clients.push({
        client: client,
        id: clientId
    })

    client.on('message', (data) => {
        try {
            data = JSON.parse(data.data || data.toString('ascii'))
        } catch (err) {
            client.send(JSON.stringify({
                body: Object.assign({}, err),
                head: {
                    id: "unknown",
                    target: clientId,
                    origin: "threadManager"
                }
            }));
            return;
        }

        if (data.head.target == "threadManager") {
            switch (data.head.type) {
                case "getThreadNames":
                    client.send(JSON.stringify({
                        body: {
                            names: clients.reduce((prev, crnt) => {
                                prev.push(crnt.id)
                                return prev
                            }, [])
                        },
                        head: {
                            id: data.head.id,
                            target: clientId,
                            origin: "threadManager"
                        }
                    }));
                    break;
                default:
                    client.send(JSON.stringify({
                        body: {
                            code: 404,
                            message: "method not found"
                        },
                        head: {
                            id: data.head.id,
                            target: clientId,
                            origin: "threadManager",
                            type: 'error'
                        }
                    }));
                    break;
            }
            return
        }

        if (!clients.some(c => c.id == data.head.target)) return client.send(JSON.stringify({
            body: {
                code: 404,
                message: "thread not found"
            },
            head: {
                id: data.head.id,
                target: clientId,
                origin: "threadManager",
                type: 'error'
            }
        }));

        logger.log(`"${data.head.origin}" made a request to "${data.head.target}" [${data.head.id}]`)
        
        clients.find(t => t.id == data.head.target).client.send(JSON.stringify(data))
    })

    client.on('close', () => {
        clients.splice(clients.findIndex((t) => t.id == clientId), 1)
    })
})

wsServer.on('listening', () => {
    process.stdout.write(JSON.stringify({
        type: "statusUpdate",
        body: {
            state: 200
        }
    }))

    setTimeout(() => {
        process.stdout.write(JSON.stringify({
            type: "initClient",
            body: {}
        }))
    }, 500)
})

httpServer.listen(5200)
