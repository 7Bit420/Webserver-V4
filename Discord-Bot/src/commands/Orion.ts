import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    switch (commandInteraction.options.getSubcommand() || commandInteraction.options.getSubcommandGroup()) {
        case "bind":
            await commandInteraction.showModal({
                components: [
                    {
                        type: 'ACTION_ROW',
                        components: [
                            {
                                type: 'TEXT_INPUT',
                                label: 'Username',
                                customId: 'username',
                                style: 1,
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'ACTION_ROW',
                        components: [
                            {
                                type: 'TEXT_INPUT',
                                label: 'Password',
                                customId: 'password',
                                style: 1,
                                required: true
                            }
                        ]
                    }
                ],
                title: 'Login to ORION',
                customId: 'login_box'
            });
            var modial = (await commandInteraction.awaitModalSubmit({ time: 10 * 1000 }))

            console.log('submit')

            var user = (await globalThis.creq('database-v2', {
                query: {
                    username: modial.fields.getTextInputValue('username') || {},
                    password: modial.fields.getTextInputValue('password') || {},
                },
                database: "User-A"
            }, 'findShelf')).body.user

            console.log('found')

            await globalThis.creq('database-v2', {
                database: "User-A",
                id: user.id,
                container: {
                    id: commandInteraction.user.id
                },
                containerName: "discord"
            }, 'editContainer')

            await globalThis.creq('database-v2', {
                database: "User-A",
                id: user.id,
                container: {
                    discordId: commandInteraction.user.id
                },
                containerName: "index"
            }, 'editContainer')

            var user = (await globalThis.creq('database-v2', {
                container: {
                    balance: 10000,
                    stocks: {},
                    items: [],
                    bio: 'This user has no Bio'
                },
                id: user.id,
                database: "User-A",
                containerName: "info"
            }, 'editContainer'))
            
            console.log('updated')

            modial.reply({ content: "Succesfuly Bound To " + user.body.username, ephemeral: true });
            break;
        case 'me':
            var user = (await globalThis.creq('database-v2', {
                query: {
                    discordId: commandInteraction.user.id
                },
                database: "User-A"
            }, 'findShelf'))

            if (!user.body.user) {
                commandInteraction.reply({ content: "Cannot find user" })
                return
            }

            var userInfo = (await globalThis.creq('database-v2', {
                id: user.body.user.id,
                database: "User-A",
                container: "info"
            }, 'getContainer')).body.container

            var embed: discord.MessageEmbed = new discord.MessageEmbed({
                title: `${user.body.user.username}`,
                description: userInfo.bio,
                thumbnail: {
                    url: userInfo.pfp ?? commandInteraction.user.avatarURL({ size: 1024 }),
                    height: 1024,
                    width: 1024,
                }
            })

            commandInteraction.reply({ embeds: [embed] })
            break;
        default:
            break;
    }

}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'SUB_COMMAND',
        name: 'bind',
        description: 'Binds your discord account to your ORION account',
        options: []
    },
    {
        type: 'SUB_COMMAND',
        name: 'me',
        description: 'displays your orion account',
        options: []
    }
]

export default {
    description: 'description',
    command: command,
    name: 'orion',
    options: options,
    id: 'orion.orion'
}
