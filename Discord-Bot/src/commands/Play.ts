import * as voice from '@discordjs/voice';
import * as discord from 'discord.js';
import * as fs from 'fs';

function lsr(path) {
    var paths: string[] = []

    fs.readdirSync(path).forEach(t => {
        if (fs.lstatSync(`${path}/${t}`).isDirectory()) {
            paths = paths.concat(
                lsr(`${path}/${t}`)
            )
        } else {
            paths.push(`${path}/${t}`)
        }
    })

    return paths
}

globalThis.config.musicPath

var songCFG = JSON.parse(fs.readFileSync(globalThis.config.songPath).toString('ascii'))
var songs = songCFG.songs.concat(...songCFG.songManifests.map(path => JSON.parse(fs.readFileSync(path).toString('ascii'))));

var mappedSongs = songs.map((t, i) => ({
    name: t.name,
    value: i.toString(10)
}))

async function command(
    commandInteraction: discord.CommandInteraction
) {
    var channel = commandInteraction.options.getChannel('channel')
    if (!(
        channel.type == "GUILD_VOICE" ||
        channel.type == "GUILD_STAGE_VOICE"
    )) return;

    if (channel.joinable) {
        var paused = true
        var song = songs[Number(commandInteraction.options.getString('song'))]
        var crntResource = voice.createAudioResource(song.path)

        var player = new voice.AudioPlayer()
        var connection = voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        })

        connection.subscribe(player)

        await new Promise(res => connection.on(voice.VoiceConnectionStatus.Ready, res))

        player.play(crntResource)
        paused = false

        var message = (await commandInteraction.reply({
            embeds: [
                {
                    title: song.name || 'Unknown',
                    description: song.description || 'This song has no description',
                    thumbnail: {
                        url: song.thumbnail || 'https://cdn.discordapp.com/app-assets/965515129678602280/988655443540836382.png',
                        width: 256,
                        height: 256
                    }
                }
            ],
            components: [
                {
                    type: "ACTION_ROW",
                    components: [
                        /*
                        {
                            type: "BUTTON",
                            emoji: "⏮",
                            style: "PRIMARY",
                            customId: "start",
                        },
                        {
                            type: "BUTTON",
                            emoji: "⏪",
                            style: "PRIMARY",
                            customId: "back",
                        },
                        //*/
                        {
                            type: "BUTTON",
                            emoji: "⏯",
                            style: "PRIMARY",
                            customId: "pause",
                        },
                        {
                            type: "BUTTON",
                            emoji: "⏹",
                            style: "PRIMARY",
                            customId: "stop"
                        },
                        /*
                        {
                            type: "BUTTON",
                            emoji: "⏩",
                            style: "PRIMARY",
                            customId: "foward"
                        },
                        {
                            type: "BUTTON",
                            emoji: "⏭",
                            style: "PRIMARY",
                            customId: "end"
                        },
                        //*/
                    ]
                }
            ],
            fetchReply: true
        }))

        var collector = new discord.InteractionCollector(globalThis.config.client, {
            message: message
        })

        collector.on('collect', (interaction) => {
            if (!interaction.isButton()) return;

            switch (interaction.customId) {
                case 'pause':
                    (paused = !paused) ? player.pause(true) : player.unpause()
                    interaction.reply({ content: paused ? 'Paused Song' : 'Playing Song', ephemeral: true })
                    break;
                case 'stop':
                    connection.destroy()
                    break;
                default:
                    interaction.reply({
                        content: 'Unknown Interaction',
                        ephemeral: true
                    })
                    break;
            }
        })

        await Promise.race([
            new Promise(res => connection.on(voice.VoiceConnectionStatus.Disconnected, res)),
            new Promise(res => connection.on(voice.VoiceConnectionStatus.Destroyed, res)),
            new Promise(res => player.on(voice.AudioPlayerStatus.Idle, res)),
        ])

        collector.stop()
        commandInteraction.deleteReply()
        if (connection.state.status != voice.VoiceConnectionStatus.Destroyed) connection.destroy();
    }

}

async function autocompleate(interaction: discord.AutocompleteInteraction) {
    interaction.respond(mappedSongs.filter(t =>
        t.name.toLowerCase().includes(interaction.options.getString('song').toLowerCase())
    ).splice(0, 24))
}

const options: discord.ApplicationCommandOptionData[] = [
    {
        type: 'CHANNEL',
        channelTypes: [
            "GUILD_VOICE",
            "GUILD_STAGE_VOICE"
        ],
        description: 'The chanel to play music in',
        name: 'channel',
        required: true
    },
    {
        type: 'STRING',
        name: 'song',
        description: 'The name of the song to play',
        autocomplete: true,
        required: true
    }
]

export default {
    description: 'plays a song in the slected channel',
    command: command,
    autocompleate: autocompleate,
    name: 'play',
    options: options,
    id: 'util.play',
    defaultPermition: true
}