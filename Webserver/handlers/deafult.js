const http = require('http')
const fs = require('fs')

exports.path = '/'
exports.special = true

exports.handler = function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {
    var url
    try {
        url = new URL(req.url, `http://${req.headers.host}`);
    } catch (err) {
        process.send({
            method: 'log',
            prams: ['normal', `IP: ${req.socket.remoteAddress} was blocked due to a susspicious request a error report has been generated`]
        });
        process.send({
            method: 'log',
            prams: ['error', err]
        });
        return;
    }
    const requrl = decodeURI(url.pathname)

    // logger.log(`${req.socket.remoteAddress} made a ${req.method} request to ${req.url}`)

    if (
        requrl.includes("./")
    ) {
        return res.end()
    }

    config.headerOverides.find(t=>t.path==requrl)?.headers.forEach(h => {
        res.setHeader(r.name,r.value)
    });

    if (
        fs.existsSync(`${dirname}/Pages${requrl}`) &&
        fs.lstatSync(`${dirname}/Pages${requrl}`).isFile() &&
        !fs.lstatSync(`${dirname}/Pages${requrl}`).isSymbolicLink()
    ) {
        res.writeHead(200, '', {
            'Content-Type': mime.find(t => requrl.endsWith(t.ext))?.mime || 'text/plain',
            'Content-Length': fs.lstatSync(`${dirname}/Pages${requrl}`).size
        })
        res.write(
            fs.readFileSync(`${dirname}/Pages${requrl}`)
        )
        res.end()
    } else if (
        fs.existsSync(`${dirname}/Pages${requrl}.html`) &&
        fs.lstatSync(`${dirname}/Pages${requrl}.html`).isFile() &&
        !fs.lstatSync(`${dirname}/Pages${requrl}.html`).isSymbolicLink()
    ) {
        res.writeHead(200, '', {
            'Content-Type': 'text/html',
            'Content-Length': fs.lstatSync(`${dirname}/Pages${requrl}.html`).size
        })
        res.write(
            fs.readFileSync(`${dirname}/Pages${requrl}.html`)
        )
        res.end()
    } else if (
        fs.existsSync(`${dirname}/Pages${requrl}`) &&
        fs.lstatSync(`${dirname}/Pages${requrl}`).isSymbolicLink()
    ) {
        res.writeHead(302, { 'location': fs.readlinkSync(`${dirname}/Pages${requrl}`).replace(dirname + "/Pages", "") })
        res.end()
    } else {
        var redirect = config.redirects.find(r => r.path == req.url)
        if (redirect) {
            res.writeHead(302, {
                'Content-Type': mime.find(t => redirect.location.endsWith(t.ext))?.mime || 'text/plain',
                'location': redirect.location
            })
            res.end()
        } else {
            res.writeHead(404, {
                'Content-Length': fs.lstatSync(`${dirname}/Pages/404.html`).size
            })
            res.write(fs.readFileSync(`${dirname}/Pages/404.html`))
            res.end()
        }
    }
}