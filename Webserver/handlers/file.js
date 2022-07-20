const fs = require('fs')
const http = require('http')
const uuid = require('uuid')

exports.path = '/fs'
exports.special = false

async function creq(target, data, type) {
    return new Promise((res, reg) => {
        var id = uuid.v4()

        function wait(data = Buffer.alloc(0)) {
            try {
                data = JSON.parse((data.data ?? data).toString('ascii'))
            } catch (err) { return console.log(err); }
            if (data?.head?.id != id) return;

            res(data)
            client.removeEventListener("message", wait)
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
    var par = decodeURIComponent(req.url).split('/').filter(t => t.length > 0)
    var cookies = new Map()

    par.splice(0, 1)
    var par = '/' + par.join('/')

    try {
        for (var i of req.headers.cookie?.split(';')) {
            var e = i.split('=')
            cookies.set(decodeURI(e[0]), decodeURI(e[1]))
        }
    } catch (err) { }

    try {
        var session = (await creq('database-v2', {
            key: cookies.get('ssid'),
            database: "Login-A"
        }, 'get'))

        var user = (await creq('database-v2', {
            id: session.body.data.user.id,
            database: "User-A"
        }, "getContainer")).body.container
    } catch (err) {
        res.writeHead(405, "logged out")
        res.write("logged out")
        return res.end()
    }

    switch (req.method) {
        case 'GET':
            var file = await creq('database-v2', {
                database: 'UFS-A',
                id: user.UFSId,
                path: par,
            }, 'get')

            if (file.head.type == 'response') {
                if (file.body.directory) {
                    res.writeHead(200, "File found", {
                        'Content-Type': 'text/directory'
                    })
                    res.write(file.body.data.reduce((crnt, prev) => {
                        return crnt + `${prev.type == 'directory' ? 'text/directory' : mime.find(
                            t => prev.name.endsWith(t.ext))?.mime || 'text/plain'}:${encodeURIComponent(prev.name)}\n`
                    }, ''));
                    res.end()
                } else {
                    var freq = http.get({
                        headers: {
                            'X-FSSessionId': file.body.data
                        },
                        port: 5202,
                        host: 'localhost',
                        path: '/'
                    })
                    freq.on('response', (fres) => {
                        fres.pipe(res)
                        fres.on('close', res.end)
                    })
                }
            } else {
                res.writeHead(404, "File not found")
                res.write("404 File not found")
                res.end()
            }
            break;
        case 'PUT':
            var buffs = []
            req.on('data', d => buffs.push(d))
            await (new Promise(res => req.on('end', res)))
            var file = (await creq('database-v2', {
                database: 'UFS-A',
                id: user.UFSId,
                path: par ?? '/',
                directory: req.headers['content-type'] == "text/directory"
            }, 'write'))

            if (file.body.id) {
                var freq = http.request({
                    host: 'localhost',
                    path: '/',
                    port: 5201,
                    method: 'PUT',
                    headers: {
                        'X-FSSessionId': file.body.id
                    }
                });

                if (!freq.write(Buffer.concat(buffs))) {
                    freq.once('drain', freq.end)
                } else freq.end();
            }

            if (file.head.type == 'response') {
                res.writeHead(200, "File edited")
                res.write("File edited")
                res.end()
            } else {
                res.writeHead(500, "Internial Error")
                res.write("Internial Error " + JSON.stringify(file.body))
                res.end()
            }
            break;
        case 'DELETE':
            if (!par || (par == '/'))  {
                res.writeHead(400,'Cannot delete root dir')
                return res.end()
            };
            var file = await creq('database-v2', {
                database: 'UFS-A',
                id: user.UFSId,
                path: par
            }, 'delete')

            if (file.head.type == 'response') {
                res.writeHead(200, "File edited")
                res.write("File edited")
                res.end()
            } else {
                res.writeHead(500, "Internial Error")
                res.write("Internial Error " + JSON.stringify(file.body))
                res.end()
            }
            break;
        case 'HEAD':
            var file = await creq('database-v2', {
                database: 'UFS-A',
                id: user.UFSId,
                path: par ?? '/',
            }, 'info')

            if (file.head.type == 'response') {
                res.writeHead(200, "File found", file.body.info)
                res.end()
            } else {
                res.writeHead(404, "File not found")
                res.end()
            }
            break;
        default:
            res.write("404 not found")
            res.end()
            break;
    }
}

