const fs = require('fs')

var { 0: x, 1: y } = process.stdout.getWindowSize()
process.stdin.setRawMode(true)

var bounds = {
    log: { x: 0.25, y: 0.7 },
    status: { x: 0.75, y: 0.7 },
    terminal: { x: 1, y: 0.3 }
}

var log = ['123', 'ABC']//new Array(Math.floor(bounds.log.y * y)).fill('Blah blah blah')
var status = new Array(Math.floor(bounds.status.y * y)).fill('Some info')
var terminal = ['Hello World', 'ABC 123']
var progress = 0

setInterval(() => {
    var { 0: x, 1: y } = process.stdout.getWindowSize()

    var out = new Array(Math.floor(y * bounds.status.y)).fill('').map((t, i) => {
        return (
            (status[i] ?? '').slice(0, Math.floor(x * bounds.status.x) - 1).padEnd(Math.floor(x * bounds.status.x) - 1, ' ') + '|' +
            (log[i] ?? '').slice(0, Math.ceil(x * bounds.log.x))).padEnd(Math.ceil(x * bounds.log.x), ' ')
    })
    out.push(''.padEnd(x, '-'));
    out.push(...terminal.slice(Math.max(0, terminal.length - Math.ceil(bounds.terminal.y * y) + 1), terminal.length)
        .map(t => t.slice(0, x).padEnd(x, ' ')))

    console.clear()
    process.stdout.write(out.join('\n'))
}, 100)

process.stdin.on('data', (data) => {
    fs.writeFileSync('out.txt', data[0].toString())
    switch (data.toString('ascii')) {
        case '':
            process.exit()
        default:
            if (data[0] == 13) {
                terminal.push('')
            } else if (data[0] == 127) {
                terminal[terminal.length - 1] = terminal[terminal.length - 1].slice(0, terminal[terminal.length - 1].length - 1)
            } else {
                terminal[terminal.length - 1] += data.toString('ascii')
            }
            break;
    }
})

