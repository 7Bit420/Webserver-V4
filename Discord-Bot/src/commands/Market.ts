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

    
}

const options: discord.ApplicationCommandOptionData[] = []

export default {
    description: 'description',
    command: command,
    name: 'fish',
    options: options,
    id: 'ecc.Fish'
}


/*

Nether Portal A: 150 170
Nether Portal B: 123 28

1131

*/