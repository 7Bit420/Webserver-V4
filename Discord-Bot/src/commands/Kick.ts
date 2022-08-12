import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {
    var member = commandInteraction.options.getMember('user')
    if (member instanceof discord.GuildMember) {
        member.kick()
            .then(() => {
                commandInteraction.reply({
                    content: "Kicked user",
                    ephemeral: true
                })
            })
            .catch(() => {
                commandInteraction.reply({
                    content: "Couldn't kick user",
                    ephemeral: true
                })
            })
    } else {
        commandInteraction.reply({
            content: "Couldn't kick user",
            ephemeral: true
        })
    }
}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'USER',
        required: true,
        name: 'user',
        description: 'The user to kick'
    }
]

export default {
    description: 'kicks a user',
    command: command,
    name: 'kick',
    options: options,
    id: 'util.kick'
}