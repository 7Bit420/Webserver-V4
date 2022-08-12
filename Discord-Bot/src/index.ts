import discord from 'discord.js';
import * as uuid from 'uuid';
import path from 'path';
import fs from 'fs';
import ws from 'ws';

var t = __dirname.split('/')
var rootPath = t.splice(0, t.length - 1).join('/');
delete globalThis.t;
process.title = 'Discord Bot'

var manifiest = JSON.parse(
    fs.readFileSync(rootPath + '/config/manifest.json').toString('ascii'));
globalThis.config = JSON.parse(
    fs.readFileSync(rootPath + '/config/config.json').toString('ascii'));

const clid = "discord-bot"
const commandManifiest: NodeJS.Dict<{
    id?: string
}> = manifiest?.commands ?? {};
const commands = new Map();
const commandIdMap = new Map()
const client = new discord.Client({
    intents: globalThis.config.intents,
})

Object.assign(globalThis.config, {
    commands: commands,
    client: client,
    commandManifiest: commandManifiest,
    commandIdMap: commandIdMap,
    dirname: __dirname
})

//#region wsClient

globalThis.creq = async function (target, data, type) {

    return new Promise((res, reg) => {
        var id = uuid.v4()

        var wait = (d) => {
            console.log(JSON.parse(d.data))
            try {
                d = JSON.parse((d?.data ?? d).toString('ascii'))
            } catch (err) { return }

            globalThis.wsClient.removeEventListener("message", wait)
            if (d?.head?.id == id) { res(d) }
        }

        globalThis.wsClient.addEventListener('message', wait)

        globalThis.wsClient.send(JSON.stringify({
            head: {
                id: id,
                target: target,
                origin: clid,
                type: type
            },
            body: data
        }))
    })
}

globalThis.wsClient = new ws.WebSocket('ws://localhost:5200', {
    headers: {
        id: clid
    },
    host: 'localhost',
    port: 5200,
    protocol: 'ws'
})

globalThis.wsClient.addEventListener('close', onDisconect)

async function onDisconect() {
    setTimeout(reconect, 1000)
}

async function reconect() {
    while (globalThis.wsClient.readyState <= 2) {

        globalThis.wsClient = new ws.WebSocket('ws://localhost:5200', {
            headers: {
                id: "database-v2"
            },
            host: 'localhost',
            port: 5200,
            protocol: 'ws'
        })

        await new Promise((res, reg) => {
            setTimeout(res, 5000)
            globalThis.wsClient.addEventListener('close', res)
        })

    }

    globalThis.wsClient.addEventListener('close', onDisconect);
}

//#endregion

//#region init

var initI = false

process.stdin.on('data', (data: any) => {
    try {
        data = JSON.parse(data.toString('ascii'))
    } catch (err) { return }

    switch (data.type) {
        case "setConfig":
            globalThis.config = Object.assign(globalThis.config, data.body.config)
            break;
    }
})

function updateStatus(code) {
    process.stdout.write(JSON.stringify({
        type: "statusUpdate",
        body: {
            state: code
        }
    }))
}

//#endregion

for (const listnerPath of fs.readdirSync(__dirname + '/event-listners').filter(t => t.endsWith('.js'))) {
    const listner = require(__dirname + '/event-listners/' + listnerPath).default

    client.on(listner.event, listner.listner);
}

client.on('ready', async () => {
    var commandIds = [];

    await client.application.commands.fetch();

    for (const commandPath of fs.readdirSync(__dirname + '/commands').filter(t => t.endsWith('.js'))) {
        const command = require(__dirname + '/commands/' + commandPath).default

        commands.set(command.id, command);

        commandManifiest[command.id] ??= {}
        if (typeof commandManifiest[command.id].id == 'string') {
            var discordCommand = client.application.commands.cache.find(c => c.id == commandManifiest[command.id].id)
            discordCommand.setOptions(command.options)
            discordCommand.setDefaultPermission(command.defaultPermission || false)

            commandIdMap.set(commandManifiest[command.id].id, command.id)
            commandIds.push(commandManifiest[command.id].id)
        } else {
            commandManifiest[command.id].id = (await client.application.commands.create({
                name: command.name,
                description: command.description,
                type: 'CHAT_INPUT',
                options: command.options,
                defaultPermission: command.defaultPermission
            })).id
            commandIdMap.set(commandManifiest[command.id].id, command.id)
            commandIds.push(commandManifiest[command.id].id)
        }
    }

    for (var c of client.application.commands.cache.filter(c => !commandIds.includes(c.id))) {
        await c[1].delete()
    }

    Object.assign(globalThis.config, {
        client: undefined
    })
    fs.writeFileSync(rootPath + '/config/manifest.json', JSON.stringify(globalThis.config))
    globalThis.config.client = client

    process.stdout.write(JSON.stringify({
        type: "getConfig"
    }))
})

var active = false

async function reconectDiscordClient() {
    while (true) {
        try {
            await client.login(globalThis.config.token)
            updateStatus(200)
            active = true
            break
        } catch (err) {
            if (active) {
                updateStatus(500)
                active = false
            }
        }
    }
}

reconectDiscordClient()
client.on('error', (err) => {
    console.log(err)
    reconectDiscordClient()
})
