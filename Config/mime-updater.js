(async () => {
    const fs = require('fs');
    const http = require('http')

    var types = [
        "application",
        "audio",
        "font",
        "image",
        "message",
        "model",
        "multipart",
        "text",
        "video"
    ];

    var output = []

    for (var v of types) {
        var data = ''
        var req = http.get({
            host: 'www.iana.org',
            path: `/assignments/media-types/${v}.csv`,
            headers: {
                'user-agent': 'WEB4'
            }
        }).on('response', (res) => {
            res.on('data', (d) => { data += d.toString('ascii') })
        })
        await new Promise((resolve, reg) => { req.on('close', resolve) })

        var rows = data.split('\n')
        var names = rows.shift().split(',')

        for (var i of rows) {
            var mime = {}
            var n = i.split(',')
            mime.ext = n[0]
            mime.mime = n[1]
            output.push(mime)
        }
    }

    fs.writeFileSync(__dirname + '/Config/mime.json', JSON.stringify(output.filter((t) => t.ext && t.mime)))
})()