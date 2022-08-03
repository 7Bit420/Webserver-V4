const cluster = require('cluster')

var shards = 20

if (cluster.isPrimary) {
    const start = 1
    const end = 65535
    const int = (end - start) / shards

    for (let p = 1; p <= shards; p++) {
        cluster.fork({
            start: Math.floor(start + (int * (p - 1))),
            end: Math.floor(start + (int * p)),
        })
    }

} else {
    (async () => {

        const dgram = require('dgram')
        const net = require('net')

        const start = Number(process.env.start)
        const end = Number(process.env.end)

        console.log(cluster.worker.id, start, end)

        const ip = '10.75.100.77'

        for (let i = start; i < end; i++) {
            var req = net.createConnection({
                port: i,
                host: ip
            })

            switch (await Promise.race([
                new Promise(res => req.addListener('error', () => res(0))),
                new Promise(res => req.addListener('connect', () => res(1))),
                new Promise(res => setTimeout(() => res(2), 500)),
            ])) {
                case 1:
                    console.log(i)
            }
        }

        console.log('done')

    })()
}

/*

Computor A:
0 10_000
Computor B:
10_000 20_000
Computor C:
10_000 30_000

*/