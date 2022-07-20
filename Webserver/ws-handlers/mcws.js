const http = require('http')
const mcEvents = require('./mcEvents/events')
const ws = require('ws')
const fs = require('fs')

exports.path = '/minecraft'
exports.special = false

/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
exports.handler = function handler(
    client, req
) {
    console.log('client connect')
    client.on('message', message => {
        try {
            var data = JSON.parse(message.toString('ascii'))
        } catch (err) {

        }

        switch (data.head.type) {
            case 'event':
                
                break;
            case 'disconnect':
                client.close()
                break;
            default:
                console.log(data)
                break;
        }
    })
}
