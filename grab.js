const fs = require('fs')
const https = require('https');

const elms = JSON.parse(fs.readFileSync('in.json').toString('ascii'));

(async () => {
    for (const elm of elms) {
        await new Promise(resolve =>
            https.get(elm.url, (res) => res.pipe(
                fs.createWriteStream(`out/${elm.name}.glb`)).on('drain', resolve)))
        console.log('DONE:' + elm.name)
    }
})()