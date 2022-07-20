#! /bin/node
const ws = require('ws')
const uuid = require('uuid')
const cp = require('child_process')

const config = require('./Config/settings.json');
const processModule = require('process');
const processes = [];

(async () => {
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
    }
})();

process.stdin.on('data', async (data) => {
    var args = data.toString('ascii').trim().split(' ')

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
    }
})

process.on('beforeExit', () => {
    processes.forEach(p => {
        p.process.kill()
    })
})

