import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    commandInteraction.reply({
        content: 'ERROR: 500 COMMAND NOT ACTIVE',
        ephemeral: true
    })
}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'STRING',
        name: 'ip',
        description: 'the ip of the server to connect to',
        required: true
    }
]

export default {
    description: 'description',
    command: command,
    name: 'connect',
    options: options,
    id: 'vista.connect'
}