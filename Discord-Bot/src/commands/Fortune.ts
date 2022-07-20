import * as discord from 'discord.js';

const fortunes = require(globalThis.config.dirname + '/util/fortunes.json')

async function command(
    commandInteraction: discord.CommandInteraction
) {
    commandInteraction.reply({
        content: fortunes[Math.floor(Math.random() * fortunes.length)]
    })
}

const options: discord.ApplicationCommandOptionData[] = []

export default {
    description: 'A command that tells yiu your fortune',
    command: command,
    name: 'fortune',
    options: options,
    id: 'test.Fortune'
}
