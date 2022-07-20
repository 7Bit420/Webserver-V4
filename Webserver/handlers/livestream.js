const stream = require('stream')
const https = require('https')
const http = require('http')
const uuid = require('uuid')
const fs = require('fs')

exports.path = '/livestream'
exports.special = false

exports.handler = function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requrl = decodeURI(url.pathname).replace(exports.path, '')
    const reqpar = requrl.split('/')

    switch (reqpar[1]) {
        case 'watch':
            if (fs.existsSync(`${dirname}/livestreams/${reqpar[2]}`)) {
                var livestream = fs.createReadStream(`${dirname}/livestreams/${reqpar[2]}`);
                livestream.on('data', (data)=>{
                    if (!res.writable) return;
                    res.writeHead(206,{
                        'Content-Type': 'video/mp4',
                        'Content-Range': `bytes ${livestream.bytesRead}-${livestream.bytesRead + data.length}/*`
                    })
                    res.write(data);
                })
                livestream.on('end',()=>{
                    // res.end()
                })
            } else {
                // res.end()
            }
            break;
    }
}
