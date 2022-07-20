const ws = require('ws')
const fs = require('fs')
const http = require('http')
const EventEmitter = require('events')

exports.path = '/games/wordle'
exports.special = false

var genid = () => 'xxx-xxx-xxx'.replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 25) + 97))

/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
exports.handler = function handler(
    client, req
) {
    var gameId = new URL(req.url, `http://${req.headers.host}`).pathname.replace(exports.path + '/', '');


    if ((globalThis.games[gameId]) && !globalThis.games[gameId].started) {
        var game = globalThis.games[gameId]

        if (Object.getOwnPropertyNames(game.clients).length >= 5) {
            client.send(JSON.parse({
                type: 'close',
                code: 1,
                cause: 'Too Many Clients'
            }))
            client.close(3000, 'Too Many Clients')
            return client.terminate()
        } else {
            var id = genid()
            while (game.clients[id]) { id = genid() }
            game.clients[id] = {
                isOwner: Object.getOwnPropertyNames(game.clients).length == 0,
                score: 0,
                done: false,
                clid: id
            }

            process.send({
                method: 'event',
                prams: [`wordle:clJoin:${gameId}`, {
                    type: 'clJoin',
                    client: game.clients[id],
                    id: id
                }]
            })

            client.send(JSON.stringify({
                type: 'open',
                code: 3,
                clid: id
            }))

            client.on('message', (data) => {
                try {
                    var msg = JSON.parse(data.toString('ascii'))
                } catch (err) { return }

                switch (msg.type) {
                    case 'finish':
                        process.send({
                            method: 'event',
                            prams: [`wordle:clFinish:${gameId}`, {
                                type: 'clFinish',
                                clid: id,
                                won: msg.won
                            }]
                        })
                        game.clients[id].done = true;
                        break;
                    case 'guess':
                        process.send({
                            method: 'event',
                            prams: [`wordle:guess:${gameId}`, {
                                type: 'guess',
                                clid: id,
                                guess: msg.guess,
                                row: msg.row
                            }]
                        })
                        break;
                    case 'start':
                        if (!game.clients[id].isOwner) return
                        process.send({
                            method: 'event',
                            prams: [`wordle:svStart:${gameId}`, {
                                type: 'start',
                                word: game.word
                            }]
                        });
                        break;
                }
            })

            client.on('close', ()=>{
                if (game.clients[id].finished) return;
                process.send({
                    method: 'event',
                    prams: [`wordle:clFinish:${gameId}`, {
                        type: 'clFinish',
                        clid: id,
                        won: false
                    }]
                })
            })

            eventDistrubitor.on(`wordle:finish:${gameId}`, () => {
                client.send(JSON.stringify({
                    type: 'end',
                    score: game.clients[id].score,
                    scores: Object.values(game.clients).reduce(c => Object.assign(c, {
                        isOwner: undefined,
                        done: undefined,
                        client: undefined
                    }))
                }))
                client.terminate()
            })

            eventDistrubitor.on(`wordle:guess:${gameId}`, (ev) => {
                client.send(JSON.stringify(ev))
            })

            eventDistrubitor.on(`wordle:clFinish:${gameId}`, (ev) => {
                client.send(JSON.stringify(ev))
            })

            eventDistrubitor.on(`wordle:clStart:${gameId}`, (ev) => {
                client.send(JSON.stringify({
                    type: 'start',
                    word: ev.word,
                    clients: ev.clients,
                    clid: id
                }))
            })
        }
    } else {
        client.send(JSON.stringify({
            type: 'close',
            code: 2,
            cause: 'Invalad Id'
        }))
        client.close(3000, 'Invalad Id')
        client.terminate()
    }

}
