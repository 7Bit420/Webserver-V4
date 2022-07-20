const ws = require('ws')
const fs = require('fs');
const uuid = require('uuid');
const Logger = require('webserver-v4-logger').Logger
var logger = Logger.prototype

const databases = {}

//#region wsClient

var client = new ws.WebSocket('ws://localhost:5200', {
    headers: {
        id: "database"
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
    reconect()
}

async function reconect() {
    while (client.readyState <= 2) {

        client = new ws.WebSocket('ws://localhost:5200', {
            headers: {
                id: "database"
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
var init = false;

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
            logger = new Logger(dirname + "/Logs/Database")

            if (!init) { initDatabase(); init = !init }
            break;
    }
})

function initDatabase() {
    for (var db of fs.readdirSync(`${dirname}/Databases/`)) { databases[db] = [] }
    fs.readdirSync(`${dirname}/Databases/User-A/`).forEach((uid) => {
        try {
            var user = JSON.parse(fs.readFileSync(`${dirname}/Databases/User-A/${uid}/user.json`).toString('ascii'))
        } catch (err) { return }

        databases['User-A'].push({
            username: user.username,
            password: user.password,
            discrimanator: user.discrimanator,
            id: user.id,
            discordId: user?.discordId
        })
    })
}



setTimeout(() => {
    process.stdout.write(JSON.stringify({
        type: "getConfig"
    }))
}, 1000)

//#endregion

function onMessage(data = Buffer.alloc(0)) {
    try {
        data = JSON.parse(data.data || data.toString('ascii'))
    } catch (err) { return console.log(data); }

    switch (data.head.type) {
        case 'findUser': //DONE
            try {
                var uid = databases[data.body.database].find(t => {
                    return Object.getOwnPropertyNames(data.body.user).every(a => t[a] == data.body.user[a])
                })?.id
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'response'
                    },
                    body: {
                        user: JSON.parse(fs.readFileSync(`${dirname}/Databases/${data.body.database}/${uid}/user.json`).toString('ascii'))
                    }
                }))
            } catch (err) {
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'error'
                    },
                    body: {
                        code: err.code == 'ENOENT' ? 404 : 500
                    }
                }))
            }
            break;
        case 'getContainer': //DONE
            try {
                if (data.body.database == "User-A") {
                    var user = JSON.parse(fs.readFileSync(`${dirname}/Databases/${data.body.database}/${data.body.id}/user.json`))
                } else {
                    var user = JSON.parse(fs.readFileSync(`${dirname}/Databases/${data.body.database}/${data.body.id}.json`))
                }
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'response'
                    },
                    body: {
                        user: user
                    }
                }))
            } catch (err) {
                console.log(`${dirname}/Databases/${data.body.database}/${data.body.id}.json`);
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'error'
                    },
                    body: {
                        code: err.code == 'ENOENT' ? 404 : 500
                    }
                }))
            }
            break;
        case 'mkUser': //DONE
            try {
                var user = Object.assign({
                    username: 'UNDERFINED',
                    password: 'UNDERFINED',
                    id: uuid.v4(),
                    discrimanator: Math.floor(Math.random() * 8999) + 1000
                }, data.body.user)

                fs.mkdirSync(`${dirname}/Databases/User-A/${user.id}/`)
                fs.writeFileSync(`${dirname}/Databases/User-A/${user.id}/user.json`, JSON.stringify(user))

                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'response'
                    },
                    body: {
                        user: user
                    }
                }))

                databases.userA.push({
                    username: user.username,
                    password: user.password,
                    discrimanator: user.discrimanator,
                    id: user.id,
                })
            } catch (err) {
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'error'
                    },
                    body: {
                        code: err.code == 'ENOENT' ? 404 : 500
                    }
                }))
            }
            break;
        case 'editContainer': //DONE 
            try {
                var user = Object.assign(
                    JSON.parse(fs.readFileSync(`${dirname}/Databases/${data.body.database}/${data.body.id}/user.json`)),
                    data.body.user
                )

                fs.writeFileSync(`${dirname}/Databases/${data.body.database}/${data.body.id}/user.json`, JSON.stringify(user))

                if (
                    data.body.database == "User-A" &&
                    Object.getOwnPropertyNames(data.body.user).some(t => t == (
                        "username" ||
                        "password" ||
                        "discrimanator" ||
                        "id"
                    ))) {
                    var i = databases.userA.findIndex(u => u.id == user.id);
                    [
                        "username",
                        "password",
                        "discrimanator",
                        "id"
                    ].forEach(v => databases.userA[i][v] == user[v])
                }

                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'response'
                    },
                    body: {
                        user: user
                    }
                }))
            } catch (err) {
                client.send(JSON.stringify({
                    head: {
                        target: data.head.origin,
                        origin: 'database',
                        id: data.head.id,
                        type: 'error'
                    },
                    body: {
                        code: err.code == 'ENOENT' ? 404 : 500
                    }
                }))
            }
            break;
        case "logTest": //DONE
            fs.writeFileSync(dirname + '/logTest.log',
                `dirname: ${dirname}\nconfig: ${JSON.stringify(config)} \nspawnArgs: ${JSON.stringify(spawnArgs)}`)
            client.send(JSON.stringify({
                head: {
                    target: data.origin,
                    origin: 'database',
                    id: data.id,
                },
                body: {
                    message: "done"
                }
            }))
            break;
        default: //DONE
            if (data.head.type == 'error') return
            console.log("error - db", data);
            client.send(JSON.stringify({
                head: {
                    target: data.origin,
                    origin: 'database',
                    id: data.id,
                },
                body: {
                    message: "UNKNOWN"
                }
            }))
            break;
    }
}

