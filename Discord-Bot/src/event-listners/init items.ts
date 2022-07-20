import * as discord from 'discord.js';

var event: keyof discord.ClientEvents = 'ready'

async function listner(ev: discord.Client<true>) {
    
}

export default {
    listner: listner,
    event
}
// 6 towmmorow