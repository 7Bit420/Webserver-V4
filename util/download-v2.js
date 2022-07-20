const https = require('https')
const fs = require('fs')
const path = require('path')

const outPath = '/Users/michael/Music/Music/Media.localized/Music/Toby Fox/Deltarune'
const requrl = 'https://www.youtube.com/playlist?list=PLEUKcNuP7bDX9RoW3HqYR6EFvWZh12upZ';

async function smartGet(...options) {
    return new Promise(async done => {
        var req1 = https.get(...options)
        req1.on('response', async (res) => {
            if ((300 <= res.statusCode) && (res.statusCode <= 399)) {
                options[0] = res.headers.location
                done(await smartGet(...options))
            } else {
                var data = ''
                res.on('data', d => data += d.toString('ascii'))

                res.on('end', () => {
                    done(data)
                })
            }
        })
    })
}

(async () => {
    var req0 = https.get(`https://youtubemultidownloader.org/scrapp/backend/yt-get.php?url=${encodeURIComponent(requrl)}`)
    var vidInfo = []
    var downloadQue = []
    await new Promise(done => {

        req0.on('response', (res) => {
            var data = ''
            res.on('data', d => data += d.toString('ascii'))

            res.on('end', () => {
                vidInfo = JSON.parse(data).items
                console.log('Got Videos')
                done()
            })
        })
    })

    for (let i of vidInfo) {
        await new Promise(done => {
            var req1 = https.get(`https://youtubemultidownloader.org/scrapp/backend/yt-get.php?url=${encodeURIComponent(i.url)}`)
            req1.on('response', (res) => {
                var data = ''
                res.on('data', d => data += d.toString('ascii'))

                res.on('end', () => {
                    data = JSON.parse(data)
                    downloadQue.push({
                        url: data.format.reduce((prev, crnt) => {
                            if ((crnt.ext == 'm4a') && (crnt.size > prev.size)) {
                                return crnt
                            } else {
                                return prev
                            }
                        }, { size: 0 }).url,
                        title: data.title,
                        thumbnail: data.thumbnails,
                        description: data.description
                    })

                    done()
                })
            })
        })
    }
    console.log('Got video config')

    var jsonManifest = []
    for (const n of downloadQue) {
        await new Promise(end => {
            https.get(n.url, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-AU,en;q=0.9',
                    'Referer': 'https://youtubemultidownloader.org/',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15',
                }
            }).end().on('response', (res) => {
                https.get(res.headers.location).on('response', (res) => {
                    res.pipe(fs.createWriteStream(`${outPath}/${n.title.replace(/\//g, '|')}.mp3`)).on('finish', end)
                })
            })
            
            jsonManifest.push({
                path: `${outPath}/${n.title.replace(/\//g, '|')}.mp3`,
                name: n.title,
                thumbnail: n.thumbnail,
                description: n.description
            })
        })
    }
    console.log('Downloaded Videos')

    fs.writeFileSync(`${outPath}/manifest.json`, JSON.stringify(jsonManifest))
})()