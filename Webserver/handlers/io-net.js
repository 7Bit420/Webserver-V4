const http = require('http')
const net = require('net')

exports.path = '/io-net'
exports.special = false

var server = net.createServer()

server.on('connection', (socket)=>{
    console.log('Client-Connected To Socket ID: ', socket.read(1)[0])
})

// server.listen(5203)

exports.handler = function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {

    

}
