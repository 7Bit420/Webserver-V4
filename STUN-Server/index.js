const udp = require('dgram')
const tcp = require('net')
const dns = require('dns')

const server = udp.createSocket({}, console.log)

server.on('message', (message, info) => {
    console.log(message.toString('ascii'), info)
    console.log('message')
})

server.on('listening', () => {
    console.log('listining')
})

server.bind(5205)

