import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    await commandInteraction?.channel?.bulkDelete(commandInteraction.options.getInteger('ammount'), true)
    commandInteraction.reply({ content: 'Purged messages' })
}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'INTEGER',
        name: 'ammount',
        description: 'The amount of messages to delete',
        required: true,
        max_value: 100,
        min_value: 10
    }
]

export default {
    description: 'Purges messages from a chanel',
    command: command,
    name: 'purge',
    options: options,
    id: 'util.purge'
}
