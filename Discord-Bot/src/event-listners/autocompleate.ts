import * as discord from 'discord.js';

async function listner(interaction: discord.AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;

    globalThis.config.commands.get(
        globalThis.config.commandIdMap.get(
            interaction.commandId)).autocompleate(interaction)
}

export default {
    listner: listner,
    event: 'interactionCreate'
}
