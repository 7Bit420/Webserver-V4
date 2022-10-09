const http = require('http')
const fs = require('fs')

exports.path = '/auth-test'
exports.special = false

exports.handler = function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {
    console.log(req.headers)
    res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="This is a login box"'
    })
    res.end()
}