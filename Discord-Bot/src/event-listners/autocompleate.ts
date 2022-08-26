import * as discord from 'discord.js';

async function listner(interaction: discord.AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;

    try {
        globalThis.config.commands.get(
            globalThis.config.commandIdMap.get(
                interaction.commandId)).autocompleate(interaction)
    } catch (error) { }
}

export default {
    listner: listner,
    event: 'interactionCreate'
}
