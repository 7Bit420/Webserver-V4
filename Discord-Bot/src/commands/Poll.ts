import * as discord from 'discord.js';

async function command(
    commandInteraction: discord.CommandInteraction
) {

    commandInteraction.reply({
        content: 'Due to unrelesaed fetaures of the discord api the poll command has been disabled',
        ephemeral: true
    })

    return;

    var optionsLen = commandInteraction.options.getInteger('options')

    var message = new discord.Modal({
        customId: 'prompt',
        title: 'Slect an option',
        components: [
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'SELECT_MENU',
                        label: 'Slect option',
                        customId: 'slect',
                        options: (() => {
                            var options: discord.MessageSelectOptionData[] = []

                            for (let i = 1; i <= optionsLen; i++) {
                                options.push({
                                    label: `Option ${i}`,
                                    value: `option-${i}`,
                                    default: i == 1
                                })
                            }

                            return options
                        })()
                    }
                ]
            },
            // /*
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'TEXT_INPUT',
                        label: 'Name',
                        customId: 'name',
                        style: 'SHORT',
                        maxLength: 15,
                        minLength: 2
                    }
                ]
            },
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'TEXT_INPUT',
                        label: 'Description',
                        customId: 'description',
                        style: 'PARAGRAPH',
                        maxLength: 200,
                        minLength: 2
                    }
                ]
            }
            //*/
        ],
    })

    var responseA = (await commandInteraction.awaitModalSubmit({ time: 1000 * 120 }))

    var embed = new discord.MessageEmbed()

    embed.setTitle('Pick a option!')

    responseA.reply({ embeds: [embed] })
}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'INTEGER',
        name: 'options',
        description: 'The ammount of options to create',
        required: true,
        maxValue: 5,
        minValue: 2
    }
]

export default {
    description: 'Creates a poll',
    command: command,
    name: 'poll',
    options: options,
    id: 'util.poll'
}