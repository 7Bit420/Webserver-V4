const stream = require('stream')
const https = require('https')
const http = require('http')
const uuid = require('uuid')
const fs = require('fs')
const ws = require('ws')

exports.path = '/livestream'
exports.special = false

/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
exports.handler = function handler(
    client, req
) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requrl = decodeURI(url.pathname).replace(exports.path, '')
    const reqpar = requrl.split('/')

    switch (reqpar[1]) {
        case 'stream':
            var id = uuid.v4()
            while (fs.existsSync(`${dirname}/livestreams/${id}`)) { id = uuid.v4() }
            var livestream = fs.createWriteStream(`${dirname}/livestreams/${id}`)

            fs.createReadStream(`${dirname}/livestreams/${id}`).on('data', console.log)

            client.on('message', (data) => {
                livestream.write(data)
            })
            client.on('close', () => livestream.close())
            break;
    }

}
