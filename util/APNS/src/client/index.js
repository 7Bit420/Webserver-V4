const tcp = require('net')
const tls = require('tls')
const fs = require('fs')

class APNSClient {

    #socket = tcp.Socket.prototype
    #tlsSocket = tls.TLSSocket.prototype

    constructor(sandbox = true) {
        this.#socket = tls.connect({
            port: 2195,
            host: sandbox ? 'gateway.sandbox.push.apple.com' : 'gateway.push.apple.com',
            cert: fs.readFileSync(__dirname + '/cert.pem'),
            key: fs.readFileSync(__dirname + '/key.pem'),
        })
        
        this.#socket.on('connect', (s) => {
            console.log('open')
        }).on('data', (data) => {
            console.log(data)
        }).on('close', () => {
            console.log('closed')
        }).on('error', console.log)
    }

}

new APNSClient()