const http = require('http')
const fs = require('fs')
const EventEmitter = require('events')

exports.path = '/games/wordle'
exports.special = false

var words = fs.readFileSync(dirname + '/Pages/games/wordle/word-list.txt').toString('ascii').split('\n')

eventDistrubitor.on('wordle:gameCreate', (ev) => {
    globalThis.games[ev.id] = ev.game

    eventDistrubitor.on(`wordle:svStart:${ev.id}`, (startEv) => {
        eventDistrubitor.emit(`wordle:clStart:${ev.id}`, {
            type: 'clStart',
            game: globalThis.games[ev.id],
            word: globalThis.games[ev.id].word,
            clients: Object.values(globalThis.games[ev.id].clients).map(c => Object.assign(c, {
                client: undefined,
                isOwner: undefined,
                score: undefined,
                done: undefined,
                client: undefined
            }))
        })
    })

    eventDistrubitor.on(`wordle:clJoin:${ev.id}`, (joinEv) => {
        globalThis.games[ev.id].clients[joinEv.id] = joinEv.client
    })

    eventDistrubitor.on(`wordle:clFinish:${ev.id}`, (finishEv) => {
        globalThis.games[ev.id].clients[finishEv.clid].finished = true
        if (Object.values(globalThis.games[ev.id].clients).every(t => t.finished)) {
            eventDistrubitor.emit(`wordle:finish:${ev.id}`, {
                type: 'finish'
            });
            eventDistrubitor.emit(`wordle:gameDelete`, {
                type: 'gameDelete',
                id: ev.id
            });
        }
    })
})

eventDistrubitor.on('wordle:gameDelete', (ev) => {
    delete globalThis.games[ev.id]
})

var genid = () => 'xxxxxx'.replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 25) + 97))

exports.handler = function handler(
    req = http.IncomingMessage.prototype,
    res = http.ServerResponse.prototype
) {

    var path = new URL(req.url, `http://${req.headers.host}`).pathname.replace(exports.path, '');

    switch (path) {
        case '/create':
            var id = genid()
            while (globalThis.games[id]) { id = genid() }

            var game = {
                clients: {},
                id: id,
                word: words[Math.floor(Math.random() * words.length)],
                started: false,
                clientsDone: 0
            }

            process.send({
                method: 'log',
                prams: ['normal', `Created A Wordle Game With Id ${id} and word "${game.word}" `]
            });

            process.send({
                method: 'event',
                prams: [`wordle:gameCreate`, {
                    type: 'gameCreate',
                    game: game,
                    id: id
                }]
            })

            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.write(id)
            res.end()
            break;
        default:
            require('./deafult').handler(req, res)
            break;
    }
}
