const ws = require('ws')
const fs = require('fs');
const uuid = require('uuid');
const http = require('http');
const EventEmitter = require('events');

var config = {};
var databases = {};
var dbconfig = {};
var dbCache = {};

var fsWriteSessions = new Map()
var fsReadSessions = new Map()

//#region wsClient
process.title = 'Database-V2'

var client = new ws.WebSocket('ws://localhost:5200', {
    headers: {
        id: "database-v2"
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
client.addEventListener('message', onMessage);

async function onDisconect() {
    process.stdout.write(JSON.stringify({
        type: "statusUpdate",
        body: {
            state: 500
        }
    }))
    setTimeout(reconect, 1000)
}

async function reconect() {
    while (client.readyState <= 2) {

        client = new ws.WebSocket('ws://localhost:5200', {
            headers: {
                id: "database-v2"
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
    client.addEventListener('message', onMessage);

    process.stdout.write(JSON.stringify({
        type: "statusUpdate",
        body: {
            state: 200
        }
    }))
}

//#endregion

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

            init()
            break;
    }
})

setTimeout(() => {
    process.stdout.write(JSON.stringify({
        type: "getConfig"
    }))
}, 1000)

//#endregion

function init() {

    config = JSON.parse(fs.readFileSync(dirname + '/V2-Databases/manifiest.json'))

    config.databases.forEach((db) => {
        dbconfig[db.id] = db;
        dbCache[db.id] = {};

        var propName = db.cachedPropities

        switch (db.type) {
            case "fs":
                fs.readdirSync(dirname + '/V2-Databases/' + db.id).forEach(id => {
                    var continer = JSON.parse(fs.readFileSync(`${dirname}/V2-Databases/${db.id}/${id}/index.json`).toString('ascii'))
                    var Obj = {}

                    for (const v of propName) {
                        Obj[v] = continer[v]
                    }

                    dbCache[db.id][id] = Obj
                })
                break;
            case "map":
                dbCache[db.id] = new Map()
                break;
        }
    });
}

http.createServer((req, res) => {
    if (!req.headers['x-fssessionid'] && !fsWriteSessions.has(req.headers['xfssessionid'])) return res.end();
    var path = fsWriteSessions.get(req.headers['x-fssessionid'])
    fs.writeFileSync(path, '')
    req.on('data', (data) => {
        fs.appendFileSync(path, data)
    })
    req.on('end', () => {
        fsWriteSessions.delete(req.headers['xfssessionid'])
        res.end();
    })
}).listen(5201, "localhost");

http.createServer((req, res) => {
    if (!req.headers['x-fssessionid'] && !fsReadSessions.has(req.headers['xfssessionid'])) return res.end();
    fsReadSessions.delete(req.headers['xfssessionid'])
    if (!res.write(fs.readFileSync(fsReadSessions.get(req.headers['x-fssessionid'])))) {
        res.once('drain', ()=>res.end())
    } else res.end();
}).listen(5202, "localhost");

function onMessage(data = Buffer.alloc(0)) {
    try {
        data = JSON.parse(data.data || data.toString('ascii'))
    } catch (err) { return console.log("ERROR", data); }

    if (!dbconfig[data.body?.database]) {
        client.send(JSON.stringify({
            head: {
                target: data.head.origin,
                origin: 'database-v2',
                id: data.head.id,
                type: 'error'
            },
            body: {
                code: 404,
                message: "database not found"
            }
        }))
        return
    }

    switch (dbconfig[data.body?.database].type) {
        case "fs":
            switch (data.head.type) {
                case "findShelf":
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'response'
                        },
                        body: {
                            user: (() => {
                                for (const i in dbCache[data.body?.database]) {
                                    if (Object.getOwnPropertyNames(data.body.query).every(t =>
                                        data.body.query[t] == dbCache[data.body?.database][i][t])) {
                                        return Object.assign(dbCache[data.body?.database][i], { id: i })
                                    }
                                }
                            })()
                        }
                    }))
                    break;
                case "getContainer":
                    try {
                        var container = JSON.parse(fs.readFileSync(
                            `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body?.container ?? "index"}.json`))
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                container: container
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500,
                            }
                        }))
                    }
                    break;
                case "editContainer":
                    try {
                        var ctp = `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body?.containerName ?? "index"}.json`
                        var container = JSON.parse(fs.existsSync(ctp) ? fs.readFileSync(ctp).toString('ascii') : '{}')

                        fs.writeFileSync(ctp, JSON.stringify(Object.assign(container, data.body.container)))

                        if (
                            (data.body?.name === undefined || data.body?.name === "index") &&
                            dbconfig[data.body?.database].cachedPropities.some(i => Object.getOwnPropertyNames(data.body.container).includes(i))
                        ) {
                            dbconfig[data.body?.database].cachedPropities.filter(
                                i => Object.getOwnPropertyNames(data.body.container).includes(i)).forEach(t =>
                                    dbCache[data.body.database][data.body.id][t] == data.body.container[t])
                        }

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                container: Object.assign(container, data.body.container),
                                old: container
                            }
                        }))
                    } catch (err) {
                        console.log(err, data)
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500
                            }
                        }))
                    }
                    break
                case "makeContainer":
                    try {
                        var ctp = `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body?.name ?? "index"}.json`
                        fs.writeFileSync(ctp, JSON.stringify(data.body.container ?? {}))

                        if (
                            (data.body?.name === undefined || data.body?.name === "index") &&
                            dbconfig[data.body?.database].cachedPropities.some((t) => Object.getOwnPropertyNames(data.body.container).includes(t))) {
                            dbconfig[data.body?.database].cachedPropities.filter((t) =>
                                Object.getOwnPropertyNames(data.body.container).includes(t)).forEach(t => {
                                    dbCache[data.body.database][data.body.id][t] = data.body.container[t]
                                })
                        }

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                container: data.body.container
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500
                            }
                        }))
                    }
                    break
                case "rmContainer":
                    try {
                        var ctp = `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body?.name ?? "index"}.json`
                        fs.writeFileSync(ctp, data.body.container ?? {})

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                code: 200
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500
                            }
                        }))
                    }
                    break;
                case "rmShelf":
                    try {
                        fs.rmSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${id}/`, { force: true, recursive: true })

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                id: id
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500
                            }
                        }))
                    }
                    break;
                case "makeShelf":
                    try {
                        var id = uuid.v4()
                        while (fs.existsSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${id}/`)) { id = uuid.v4() }
                        fs.mkdirSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${id}/`)

                        dbCache[data.body?.database][id] = {}

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                id: id
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code == 'ENOENT' ? 404 : 500
                            }
                        }))
                    }
                    break;
                case 'getCache':
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'response'
                        },
                        body: {
                            cache: dbCache[data.body.database]
                        }
                    }))
                    break;
                default:
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'error'
                        },
                        body: {
                            code: 400,
                            message: "method not found"
                        }
                    }))
                    break;
            }
            break;
        case "map":
            switch (data.head.type) {
                case "get":
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'response'
                        },
                        body: {
                            data: dbCache[data.body?.database]?.get(data.body?.key)
                        }
                    }))
                    break;
                case "set":
                    dbCache[data.body?.database]?.set(data.body?.key, data.body?.data)
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'response'
                        },
                        body: {
                            succes: true
                        }
                    }))
                    break;
                case "delete":
                    dbCache[data.body?.database]?.delete(data.body?.key)
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'response'
                        },
                        body: {
                            succes: true
                        }
                    }))
                    break;
                default:
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'error'
                        },
                        body: {
                            code: 400,
                            message: "method not found"
                        }
                    }))
                    break;
            }
            break;
        case "fsmap":
            switch (data.head.type) {
                case 'info':
                    try {
                        var info = fs.lstatSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body.path}`)
                        info
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                info: {

                                }
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                case "get":
                    try {
                        var path = `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}${data.body.path}`
                        var dir = fs.lstatSync(path).isDirectory()


                        if (!dir) {
                            var id = uuid.v4()
                            fsReadSessions.set(id, path)
                        }

                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                data: dir ? fs.readdirSync(path, { withFileTypes: true }).reduce((prev, crnt) => {
                                    if (crnt.isFile()) {
                                        prev.push({
                                            type: 'file',
                                            name: crnt.name
                                        })
                                    } else if (crnt.isDirectory()) {
                                        prev.push({
                                            type: 'directory',
                                            name: crnt.name
                                        })
                                    } else {
                                        prev.push({
                                            type: 'hazard',
                                            name: crnt.name
                                        })
                                    }
                                    return prev
                                }, []) : id,
                                directory: dir
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                case "write":
                    try {
                        var path = `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body.path}`
                        if (data.body.directory) {
                            fs.mkdirSync(path, { recursive: true });
                            client.send(JSON.stringify({
                                head: {
                                    target: data.head.origin,
                                    origin: 'database-v2',
                                    id: data.head.id,
                                    type: 'response'
                                },
                                body: {}
                            }));
                        } else {
                            var id = uuid.v4();
                            fsWriteSessions.set(id, path)
                            client.send(JSON.stringify({
                                head: {
                                    target: data.head.origin,
                                    origin: 'database-v2',
                                    id: data.head.id,
                                    type: 'response'
                                },
                                body: {
                                    id: id
                                }
                            }));
                        }

                    } catch (err) {
                        console.log(err);
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                case "delete":
                    try {
                        if (!data.body.path || (data.body.path == '/')) throw new TypeError('Path cannot be root');
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                data: fs.rmSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/${data.body.path}`, {
                                    force: true, recursive: true
                                })
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                case "mkImage":
                    try {
                        var id = uuid.v4()
                        while (fs.existsSync(
                            `${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${id}`)) { id = uuid.v4() }
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                data: fs.mkdirSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${id}`),
                                id: id
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                case "rmImage":
                    try {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'response'
                            },
                            body: {
                                data: fs.rmSync(`${dirname}/V2-Databases/${dbconfig[data.body?.database].id}/${data.body.id}/`)
                            }
                        }))
                    } catch (err) {
                        client.send(JSON.stringify({
                            head: {
                                target: data.head.origin,
                                origin: 'database-v2',
                                id: data.head.id,
                                type: 'error'
                            },
                            body: {
                                code: err.code,
                                message: err.message
                            }
                        }))
                    }
                    break;
                default:
                    console.log("DB MFD ERR");
                    client.send(JSON.stringify({
                        head: {
                            target: data.head.origin,
                            origin: 'database-v2',
                            id: data.head.id,
                            type: 'error'
                        },
                        body: {
                            code: 400,
                            message: "method not found"
                        }
                    }))
                    break;
            }
            break;
        default:
            console.log("DB CFG ERR");
            client.send(JSON.stringify({
                head: {
                    target: data.head.origin,
                    origin: 'database-v2',
                    id: data.head.id,
                    type: 'error'
                },
                body: {
                    code: 500,
                    message: "database configured incorectly"
                }
            }))
            break;
    }
}

