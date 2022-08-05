#! /usr/local/bin/node
const EventEmiter = require('events')
const cp = require('child_process')
const uuid = require('uuid')
const net = require('net')
const ws = require('ws')
const fs = require('fs')
const os = require('os')

const config = require('./Config/settings.json');
const processModule = require('process');
const processes = [];
const gloabalEvEmitter = new EventEmiter();

process.title = 'Webserver V4 Process Handler';

(async () => {
    if (fs.existsSync('/tmp/WS-4-Gloabl.sock')) {
        try {
            net.createConnection('/tmp/WS-4-Gloabl.sock')
                .on('error', () => { })
                .write('{"type":"handover"}\u0004')
        } catch { }
        fs.unlinkSync('/tmp/WS-4-Gloabl.sock')
        await new Promise(res => setTimeout(res, 1000))
    }

    net.createServer(function (socket) {
        var crntPacket = '';

        socket.on('data', (data) => {
            crntPacket += data.toString('ascii')
            if (data.at(data.length - 1) == 4) { phrasePacket() }
        });

        function phrasePacket() {
            crntPacket = crntPacket.replace('\u0004', '')
            var data = {}
            try {
                data = JSON.parse(crntPacket)
                crntPacket = ''
            } catch (err) { console.log(crntPacket, err); crntPacket = ''; return }

            switch (data.type) {
                case 'event':
                    gloabalEvEmitter.emit(data.body.type, ...data.body.eventData)
                    gloabalEvEmitter.emit('event', data.body.type, ...data.body.eventData)
                    break;
                case 'restart':
                    exit(true)
                case 'handover':
                    exit()
                case 'function':
                    require(data.body.path)(...data.body.args)
                    break;
            }
        }
    }).listen('/tmp/WS-4-Gloabl.sock');

    for (let i = 0; i < config.subprocesses.length; i++) {
        const pPath = config.subprocesses[i].path;

        const process = cp.spawn('node', [__dirname + '/' + pPath], {
            env: Object.assign(processModule.env, {
                config: JSON.stringify(config.subprocesses[i].config),
                spawnArgs: JSON.stringify(config.subprocesses[i].spawnArgs),
                dirname: __dirname,
            }),
        })

        process.stderr.on('data', (data) => {
            console.log("THREAD: " + pPath + "\nERR: " + data.toString('ascii'));
        })

        process.stdout.on('data', (d) => {
            try {
                var data = JSON.parse(d.toString('ascii'))
            } catch (err) { return require('process').stdout.write(d) };

            switch (data.type) {
                case "statusUpdate":
                    switch (data.body.state) {
                        case 200:
                            console.log(`THREAD ACTIVE: ${pPath}`);
                            break;
                        case 500:
                            console.log(`THREAD UNACTIVE: ${pPath}`);
                            break;
                        default:
                            console.log(`THREAD: ${pPath} switched to unknown state: ${data.body.state}`);
                            break;
                    }
                    break;
                case "getConfig":
                    process.stdin.write(JSON.stringify({
                        type: "setConfig",
                        body: {
                            config: config.subprocesses[i].config,
                            spawnArgs: config.subprocesses[i].spawnArgs,
                            dirname: __dirname
                        }
                    }))
                    break;
                case "initClient":
                    //#region wsClient
                    client = new ws.WebSocket('ws://localhost:5200', {
                        headers: {
                            id: "root"
                        },
                        host: 'localhost',
                        port: 5200,
                        protocol: 'ws'
                    })

                    client.addListener('open', () => {
                        process.stdout.write(JSON.stringify({
                            type: "statusUpdate",
                            body: {
                                state: 200
                            }
                        }))
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
                                    id: "root"
                                },
                                host: 'localhost',
                                port: 5200,
                                protocol: 'ws'
                            })

                            await new Promise((res, reg) => {
                                setTimeout(res, 5000)
                                client.addEventListener('close', res)
                            })

                        }

                        client.addEventListener('close', onDisconect);

                        process.stdout.write(JSON.stringify({
                            type: "statusUpdate",
                            body: {
                                state: 200
                            }
                        }))
                    }

                    //#endregion
                    break;
            }
        })

        await new Promise((res) => {
            process.stdout.on('data', (d) => {
                try {
                    var data = JSON.parse(d.toString('ascii'))
                } catch (err) { return };

                if (data.type == "statusUpdate" && data.body.state == 200) res(200);
            })
        })

        processes.push({
            process: process
        })

        gloabalEvEmitter.on('event', (eventName, ...args) => process.stdin.write(JSON.stringify({
            eventName, args
        })))
    }
})();

process.stdin.setRawMode(true)
process.stdin.setNoDelay(true)
var crntCmd = ''

process.stdin.on('data', async (data) => {

    switch (data.toString('ascii')) {
        case '\u0003':
            exit(true)
        case '\n':
            execFunc(...crntCmd.split(' '))
        default:
            crntCmd += data.toString('ascii')
    }
})

function execFunc(...args) {
    switch (args[0]) {

        case "logTest":
            var id = uuid.v4()
            client.send(JSON.stringify({
                head: {
                    id: id,
                    origin: 'root',
                    target: 'database',
                    type: 'logTest'
                },
                body: {}
            }))

            var onMessage = function (data) {
                try {
                    data = JSON.parse(data.data || data.toString('ascii'))
                } catch (err) { return }
                if (data.head.id != id) return;

                console.log("Done");
                client.removeEventListener("message", onMessage)

                console.log(client.listeners().length);
            }

            client.addEventListener('message', onMessage)
            break;
        case "threadNames":
            var id = uuid.v4()
            client.send(JSON.stringify({
                head: {
                    id: id,
                    origin: 'root',
                    target: 'threadManager',
                    type: 'getThreadNames'
                },
                body: {}
            }))

            var onMessage = function (data) {
                try {
                    data = JSON.parse(data.data || data.toString('ascii'))
                } catch (err) { return }
                if (data.head.id != id) return;

                console.log(data.body.names?.join(' '));

                client.removeEventListener("message", onMessage)
            }

            client.addEventListener('message', onMessage)
            break;
        case "getUser":
            var id = uuid.v4()
            client.send(JSON.stringify({
                head: {
                    id: id,
                    origin: 'root',
                    target: 'database',
                    type: 'getUser'
                },
                body: {
                    id: args[1]
                }
            }))

            var onMessage = function (data) {
                try {
                    data = JSON.parse(data.data || data.toString('ascii'))
                } catch (err) { return }
                if (data.head.id != id) return;

                console.log(data.body);

                client.removeEventListener("message", onMessage)
            }

            client.addEventListener('message', onMessage)
            break;
        case "mkUser":
            var id = uuid.v4()
            client.send(JSON.stringify({
                head: {
                    id: id,
                    origin: 'root',
                    target: 'database',
                    type: 'mkUser'
                },
                body: {
                    user: {
                        username: args[1],
                        password: args[2]
                    }
                }
            }))

            var onMessage = function (data) {
                try {
                    data = JSON.parse(data.data || data.toString('ascii'))
                } catch (err) { return }
                if (data.head.id != id) return;

                console.log(data.body);

                client.removeEventListener("message", onMessage)
            }

            client.addEventListener('message', onMessage)
            break;
        case "editUser":
            var id = uuid.v4()
            var uid = args[1]

            var Obj = {}

            args.splice(0, 2)
            for (const i of args) {
                var t = i.split(':')

                Obj[t[0]] = t[1]
            }

            console.log(Obj);

            client.send(JSON.stringify({
                head: {
                    id: id,
                    origin: 'root',
                    target: 'database',
                    type: 'editUser'
                },
                body: {
                    id: uid,
                    user: Obj
                }
            }))

            var onMessage = function (data) {
                try {
                    data = JSON.parse(data.data || data.toString('ascii'))
                } catch (err) { return }
                if (data.head.id != id) return;

                console.log(data.body);

                client.removeEventListener("message", onMessage)
            }

            client.addEventListener('message', onMessage)
            break;
        case 'exit':
            exit(true)
    }
}

function exit(restart) {
    processes.forEach(p => {
        p.process.kill()
    })
    if (restart) {
        cp.spawn('node', [__filename], {
            detached: true,
            silent: true,
            stdio: 'ignore'
        })
        process.exit()
    } else {
        process.exit()
    }
}

