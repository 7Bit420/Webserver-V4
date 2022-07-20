const https = require('https')
const http = require('http')
const uuid = require('uuid')
const url = require('url')

exports.path = '/user'
exports.special = false

const userProp = {
    username: "string",
    password: "string",
    email: "string",
    returnToHome: "boolean"
}

function getBlacklist(type) {
    switch (type) {
        case "discord":

            break;
        default:
            return {
                username: undefined,
                password: undefined
            }
    }
}

async function creq(target, data, type) {

    return new Promise((res, reg) => {
        var id = uuid.v4()

        function wait(data = Buffer.alloc(0)) {
            try {
                data = JSON.parse((data.data ?? data).toString('ascii'))
            } catch (err) { return }

            client.removeEventListener("message", wait)
            if (data?.head?.id == id) { res(data) }
        }

        client.addEventListener('message', wait)

        client.send(JSON.stringify({
            head: {
                id: id,
                target: target,
                origin: clid,
                type: type
            },
            body: data
        }))
    })
}

function genid() {
    return "xxxxxxxxxx-xxxxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxxxx-xxxxxxxxxx".replace(/x/g, () => {
        return String.fromCharCode(Math.floor(Math.random() * 24) + 97)
    })
}

exports.handler = async function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {
    var par = req.url.split('/')
    var cookies = new Map()

    try {
        for (var i of req.headers.cookie?.split(';')) {
            var e = i.split('=')
            cookies.set(decodeURI(e[0]), decodeURI(e[1]))
        }
    } catch (err) { }

    switch (par[2]) {
        case 'feed':
            try {
                var session = (await creq('database-v2', {
                    key: cookies.get('ssid'),
                    database: "Login-A"
                }, 'get'))

                var user = (await creq('database-v2', {
                    id: session.body.data.user.id,
                    database: "User-A"
                }, "getContainer")).body.container

                res.end()
                var data = ""
                var items = []
                var request = https.request({
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`
                    },
                    path: '/api/v9/users/@me',
                    host: 'discord.com',
                    method: 'GET'
                })

                request.on('response', (res) => {
                    console.log(res.statusCode);
                    res.on('data', d => data += d.toString('ascii'))
                })

                request.end()

                await new Promise((res, reg) => request.on('close', res))

                console.log(JSON.parse(data));
            } catch (err) {
                // console.log(err);
                res.writeHead(404, 'user not found')
                res.write('{ code: 404 }')
                res.end()
            }
            break;
        case "login":
            try {
                var data = ""
                await new Promise((res) => {
                    req.on('data', d => data += d.toString('ascii'))
                    req.on('close', res)
                })
                data = JSON.parse(data)

                var user = (await creq('database-v2', {
                    query: {
                        username: data.username || {},
                        password: data.password || {},
                    },
                    database: "User-A"
                }, 'findShelf')).body.user

                var ssid = genid();

                res.writeHead(200, "Loged in", {
                    'set-cookie': `ssid=${ssid}; expires=${Date.now() + 21600000}; path=/;`,
                    'content-type': "application/json"
                })
                res.write(JSON.stringify(Object.assign(user, { sid: ssid })))
                res.end()

                creq('database-v2', {
                    data: { user: user, expires: Date.now() + 21600000 },
                    key: ssid,
                    database: "Login-A"
                }, 'set')
            } catch (err) {
                res.writeHead(404, 'user not found')
                res.write('{ code: 404 }')
                res.end()
            }
            break;
        case "query":
            try {
                var data = ""
                await new Promise((res) => {
                    req.on('data', d => data += d.toString('ascii'))
                    req.on('close', res)
                })

                res.write(JSON.stringify(Object.assign(
                    (await creq('database-v2', {
                        query: Object.assign(JSON.parse(data), getBlacklist()),
                        database: "User-A"
                    }, 'findShelf')).body.user,
                    getBlacklist())))
                res.end()
            } catch (err) {
                res.writeHead(404, 'user not found')
                res.write('{ code: 404 }')
                res.end()
            }
            break;
        case "me":
            try {
                var session = (await creq('database-v2', {
                    key: cookies.get('ssid'),
                    database: "Login-A"
                }, 'get'))

                var user = await creq('database-v2', {
                    id: session.body.data.user.id,
                    container: par[3] || "index",
                    database: "User-A"
                }, "getContainer")

                res.write(JSON.stringify(Object.assign(user.body.container, getBlacklist(par[3]))))
            } catch (err) {
                res.write('{}')
            }
            res.end()
            break;
        case "signup":
            if (req.method !== "POST") return res.end();
            var data = ""
            await new Promise((res) => {
                req.on('data', d => data += d.toString('ascii'))
                req.on('close', res)
            })
            var user = {}

            switch (req.headers['content-type']) {
                case "application/json":
                    try {
                        user = JSON.parse(data)
                    } catch (err) { return res.end() }
                    break;
                case "application/x-www-form-urlencoded":
                    try {
                        for (const t of data.split('&')) {
                            var i = t.split('=')

                            i[0] = decodeURIComponent(i[0])
                            i[1] = decodeURIComponent(i[1])

                            user[i[0]] = Number.isInteger(Number(i[1])) ?
                                Number(i[1]) :
                                (i[1] == 'true' || i[1] == 'false') ?
                                    Boolean(i[1]) : i[1]
                        }
                    } catch (err) { return res.end() }
                    break;
                default:
                    return res.end();
            }

            if (
                (() => {
                    for (const n in userProp) {
                        if (typeof user[n] != userProp[n]) return true;
                    }
                    return false
                })()
            ) return res.end("{ code: 400 }")

            var id = (await creq('database-v2', {
                database: "User-A"
            }, 'makeShelf')).body.id

            user.UFSId = (await creq('database-v2', {
                database: "UFS-A"
            }, 'mkImage')).body.id

            if (user.returnToHome) {
                res.writeHead(301, 'Account Created', {
                    location: '/orion/home'
                })
                var container = (await creq('database-v2', {
                    id: id,
                    container: Object.assign(user, { id: id, returnToHome: undefined }),
                    database: "User-A"
                }, 'makeContainer'))
            } else {
                var container = (await creq('database-v2', {
                    id: id,
                    container: Object.assign(user, { id: id, returnToHome: undefined }),
                    database: "User-A"
                }, 'makeContainer'))
                res.write(JSON.stringify(container.body.container))
            }
            
            
            res.end()
            break;
        default:
            res.write("404 not found")
            res.end()
            break;
    }
}

