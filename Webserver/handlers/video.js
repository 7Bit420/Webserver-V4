const fs = require('fs')
const http = require('http')
const uuid = require('uuid')
const https = require('https')

exports.path = '/stream'
exports.special = false

var bite = 10 ** 8

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res
 */
exports.handler = function handler(
    req,
    res
) {
    var fileinfo
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requrl = decodeURI(url.pathname).replace(exports.path, '')

    if (
        fs.existsSync(`${dirname}/Pages${requrl}`) &&
        (fileinfo = fs.lstatSync(`${dirname}/Pages${requrl}`)).isFile()
    ) {
        function handle () {
            fileinfo = fs.lstatSync(`${dirname}/Pages${requrl}`)
            var range = req.headers.range?.split('=')

            const videoSize = fileinfo.size
            const start = Number(range?.[1]?.split('-')?.[0] ?? 0);
            const end = Math.min(Number(range?.[1]?.split('-')?.[1] ?? bite), videoSize - 1);
            const contentLength = end - start + 1;

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${ videoSize || '*'}`,
                "Accept-Ranges": `bytes`,
                "Content-Length": contentLength,
                "Content-Type": mime.find(t => requrl.endsWith(t.ext.toLowerCase()))?.mime || 'video/mp4',
                // "Link": `<http://${req.headers.host}/videos/inject.js>; rel="script"`
            };

            if (end != videoSize - 1) { 
                res.writeHead(206, headers) 
            } else {
                res.writeHead(200, headers);
                res.on('unpipe', () => res.end())
            };
            const videoStream = fs.createReadStream(`${dirname}/Pages${requrl}`, { start: start, end: end });
            videoStream.pipe(res);
        }

        req.on('resume', handle);
        
        handle()
    } else {
        res.end()
    }
}


/*

https://books.google.com.au/books/content?id=_828x3WNBd8C&pg=PP5&img=1&zoom=3&hl=en&bul=2&sig=ACfU3U2nH6W7AMwcLWeE0icEII6xF1rI5Q&w=1280
https://books.google.com.au/books/content?id=_828x3WNBd8C&pg=PP5&img=1&zoom=3&hl=en&bul=1&sig=ACfU3U3qK5n-ZyhEBsIty9SOg9Zk4I8iBg&w=1280

https://books.google.com.au/books
?id=_828x3WNBd8C
&newbks=0
&lpg=PP1
&dq=the%20curious%20incident%20of%20the%20dog%20in%20the%20nighttime
&pg=PA2
&source=entity_page
&jscmd=click3&vq=the%20curious%20incident%20of%20the%20dog%20in%20the%20nighttime

*/
