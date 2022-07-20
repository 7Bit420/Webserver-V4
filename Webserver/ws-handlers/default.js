const ws = require('ws')
const fs = require('fs')
const http = require('http')

exports.path = '/'
exports.special = true

/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
exports.handler = function handler(
    client, req
) {
    client.close()
}
