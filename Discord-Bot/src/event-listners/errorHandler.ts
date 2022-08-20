import * as discord from 'discord.js';

async function listner(err: Error) {
    console.log('Error: \n', err)
}

export default {
    listner: listner,
    event: 'error'
}
