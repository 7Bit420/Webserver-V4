const ws = require('ws')
const fs = require('fs')
const http = require('http')
const events = require('events')

exports.path = '/io'
exports.special = false

/*

// VEREY IMPORTANT NOTE 

// Plug USB BUS into the FAR port of LAPTOP

// Plug ardwino for SOUND BASED SENSOR into the FIRT port on USB BUS
// Plug ardwino for LIGHT BASED SENSOR into the SECOND port on USB BUS

/dev/cu.usbmodem142101

*/

class rolingBuffer extends Array {

    #length = 20

    constructor(length) {
        super();

        this.#length ??= length
    }

    push(elm) {
        this[Math.min(this.length, this.#length - 1)] = elm;
        if (this.length == this.#length) { this.shift() }
    }
}

var goal1buff = new rolingBuffer(20).fill(0);
var goal1Listner = new events.EventEmitter();
var goal1lastTriggerd = false;
var goal1port = '/dev/cu.usbmodem142401';

var goal2buff = new rolingBuffer(10).fill(1023);
var goal2Listner = new events.EventEmitter();
var goal2lastTriggerd = false;
var goal2port = '/dev/cu.usbmodem142101';

if (fs.existsSync(goal1port)) {
    fs.createReadStream(goal1port)
        .on('data', (data) => {
            for (i of data) { goal1buff.push(i); }

            var avg1 = goal1buff.reduce((t, a, b, v) => { return t + a }, 0) / goal1buff.length;
            if (
                avg1 < 30 && goal1lastTriggerd + 5000 < Date.now()
            ) {
                goal1Listner.emit('trigger', avg1);
                goal1lastTriggerd = Date.now();
            };
        })
        .on('close', () => {
            console.log("Goal 1 closed")
        })
}

if (fs.existsSync(goal2port)) {
    fs.createReadStream(goal2port)
        .on('data', (data) => {
            for (i of data) { goal2buff.push(i); }
        })
        .on('close', () => {
            console.log("Goal 2 closed")
        })
}

setInterval(() => {
    var avg2 = goal2buff.sort().at(Math.round(goal2buff.length / 2));
    if (
        avg2 > 230 && goal2lastTriggerd + 5000 < Date.now()
    ) {
        goal2Listner.emit('trigger', avg2);
        goal2lastTriggerd = Date.now();
    }
}, 1000)

/**
 * 
 * @param {ws.WebSocket} client 
 * @param {http.IncomingMessage} req 
 */
exports.handler = function handler(
    client, req
) {

    switch (req.url.replace('/io', '')) {
        case '/goal1':
            function goal1Emiter(avg) {
                client.send(JSON.stringify({
                    at: Date.now(),
                    event: 'trigger',
                    distance: avg,
                    lastTriggerd: goal1lastTriggerd
                }));
            }
            client.on('close', () => {
                try {
                    goal1Listner.removeListener(goal1Emiter)
                } catch (error) { }
            })
            goal1Listner.on('trigger', goal1Emiter)
            break;
        case '/goal2':
            function goal2Emiter(avg) {
                client.send(JSON.stringify({
                    at: Date.now(),
                    event: 'trigger',
                    distance: avg,
                    lastTriggerd: goal2lastTriggerd
                }))
            }
            client.on('close', () => {
                try {
                    goal2Listner.removeListener(goal2Emiter)
                } catch (error) { }
            })
            goal2Listner.on('trigger', goal2Emiter)
            break;
        default:
            client.close(4004)
            break;
    }
}

