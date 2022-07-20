const fs = require('fs')
const http = require('http')
const uuid = require('uuid')
const https = require('https')

exports.path = '/ext'
exports.special = false

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

exports.handler = async function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {
    var requrl = new URL(req.url, `http://${req.headers.host}`);
    var reqpar = requrl.pathname.split('/')
    var cookies = new Map()

    try {
        for (var i of req.headers.cookie?.split(';')) {
            var e = i.split('=')
            cookies.set(decodeURI(e[0]), decodeURI(e[1]))
        }
    } catch (err) { }

    switch (reqpar[2]) {
        case "oauth-compleate":
            var session = (await creq('database-v2', {
                key: cookies.get('ssid'),
                database: "Login-A"
            }, 'get'))

            var user = await creq('database-v2', {
                id: session.body?.data?.user?.id,
                database: "User-A"
            }, "getContainer")

            if (user.head.type != 'response') {
                res.write('Not logged in')
                res.end()
                return
            }

            switch (reqpar[3]) {
                case "discord":
                    var code = requrl.searchParams.get('code')
                    var data = ""
                    var rescode = 0

                    var reqest = https.request({
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic ${code}`
                        },
                        method: "POST",
                        path: "/api/oauth2/token",
                        host: "discordapp.com"
                    });
                    reqest.on('response', (response) => {
                        response.on('data', (d) => {
                            data += d.toString('ascii')
                        })
                        rescode = response.statusCode
                    })
                    reqest.write(`grant_type=authorization_code&client_id=${discordConfig.appId}&client_secret=${discordConfig.secret}&redirect_uri=${encodeURIComponent(discordConfig.redirect)}&code=${code}`)
                    reqest.end()

                    await new Promise((res, reg) => reqest.on('close', res))

                    if (rescode == 200) {
                        res.write(fs.readFileSync(`${dirname}/Pages/ext/sucess/discord.html`))
                        data.expires_in += Date.now();
                        creq('database-v2', {
                            database: "User-A",
                            id: user.body.container.id,
                            container: JSON.parse(data),
                            containerName: "discord"
                        }, 'editContainer')
                    } else {
                        res.write(fs.readFileSync(`${dirname}/Pages/ext/error/discord.html`))
                    }

                    res.end()
                    break;
            }
            break;
        default:
            require('./deafult').handler(req, res)
            break;
    }
}

