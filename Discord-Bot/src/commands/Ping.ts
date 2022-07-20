import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    commandInteraction.reply({
        content: "Pong!",
        ephemeral: true
    })
}

const options: discord.ApplicationCommandOptionData[] = []

export default {
    description: 'description',
    command: command,
    name: 'ping',
    options: options,
    id: 'test.ping'
}