import * as discord from 'discord.js';

async function listner(interaction: discord.Interaction) {
    if (!interaction.isCommand()) return;

    globalThis.config.commands.get(
        globalThis.config.commandIdMap.get(
            interaction.commandId)).command(interaction)
}

export default {
    listner: listner,
    event: 'interactionCreate'
}
