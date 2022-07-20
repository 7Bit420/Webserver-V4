import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    var user = (await globalThis.creq('database-v2', {
        query: {
            discordId: commandInteraction.user.id
        },
        database: "User-A"
    }, 'findShelf'))

    if (!user.body.user) {
        commandInteraction.reply({ content: "Cannot find user" })
        return;
    }

    var userInfo = (await globalThis.creq('database-v2', {
        id: user.body.user.id,
        database: "User-A",
        container: "info"
    }, 'getContainer')).body.container

    var ammount = Math.floor(Math.random() * 35);

    globalThis.creq('database-v2', {
        id: user.body.user.id,
        database: "User-A",
        container: {
            balance: userInfo.balance + ammount
        },
        containerName: "info"
    }, 'editContainer')

    commandInteraction.reply({
        content: `Fished ${ammount} dollars`,
        ephemeral: true
    })
}

const options: discord.ApplicationCommandOptionData[] = []

export default {
    description: 'description',
    command: command,
    name: 'fish',
    options: options,
    id: 'ecc.Fish'
}