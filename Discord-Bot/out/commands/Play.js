"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
exports.__esModule = true;
var voice = __importStar(require("@discordjs/voice"));
var discord = __importStar(require("discord.js"));
var fs = __importStar(require("fs"));
function lsr(path) {
    var paths = [];
    fs.readdirSync(path).forEach(function (t) {
        if (fs.lstatSync("".concat(path, "/").concat(t)).isDirectory()) {
            paths = paths.concat(lsr("".concat(path, "/").concat(t)));
        }
        else {
            paths.push("".concat(path, "/").concat(t));
        }
    });
    return paths;
}
globalThis.config.musicPath;
var songCFG = JSON.parse(fs.readFileSync(globalThis.config.songPath).toString('ascii'));
var songs = (_a = songCFG.songs).concat.apply(_a, __spreadArray([], __read(songCFG.songManifests.map(function (path) { return JSON.parse(fs.readFileSync(path).toString('ascii')); })), false));
var mappedSongs = songs.map(function (t, i) { return ({
    name: t.name,
    value: i.toString(10)
}); });
function command(commandInteraction) {
    return __awaiter(this, void 0, void 0, function () {
        var channel, paused, song, crntResource, player, connection, message, collector;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    channel = commandInteraction.options.getChannel('channel');
                    if (!(channel.type == "GUILD_VOICE" ||
                        channel.type == "GUILD_STAGE_VOICE"))
                        return [2 /*return*/];
                    if (!channel.joinable) return [3 /*break*/, 4];
                    paused = true;
                    song = songs[Number(commandInteraction.options.getString('song'))];
                    crntResource = voice.createAudioResource(song.path);
                    player = new voice.AudioPlayer();
                    connection = voice.joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guildId,
                        adapterCreator: channel.guild.voiceAdapterCreator
                    });
                    connection.subscribe(player);
                    return [4 /*yield*/, new Promise(function (res) { return connection.on(voice.VoiceConnectionStatus.Ready, res); })];
                case 1:
                    _a.sent();
                    player.play(crntResource);
                    paused = false;
                    return [4 /*yield*/, commandInteraction.reply({
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
                                            customId: "pause"
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
                        })];
                case 2:
                    message = (_a.sent());
                    collector = new discord.InteractionCollector(globalThis.config.client, {
                        message: message
                    });
                    collector.on('collect', function (interaction) {
                        if (!interaction.isButton())
                            return;
                        switch (interaction.customId) {
                            case 'pause':
                                (paused = !paused) ? player.pause(true) : player.unpause();
                                interaction.reply({ content: paused ? 'Paused Song' : 'Playing Song', ephemeral: true });
                                break;
                            case 'stop':
                                connection.destroy();
                                break;
                            default:
                                interaction.reply({
                                    content: 'Unknown Interaction',
                                    ephemeral: true
                                });
                                break;
                        }
                    });
                    return [4 /*yield*/, Promise.race([
                            new Promise(function (res) { return connection.on(voice.VoiceConnectionStatus.Disconnected, res); }),
                            new Promise(function (res) { return connection.on(voice.VoiceConnectionStatus.Destroyed, res); }),
                            new Promise(function (res) { return player.on(voice.AudioPlayerStatus.Idle, res); }),
                        ])];
                case 3:
                    _a.sent();
                    collector.stop();
                    commandInteraction.deleteReply();
                    if (connection.state.status != voice.VoiceConnectionStatus.Destroyed)
                        connection.destroy();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function autocompleate(interaction) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            interaction.respond(mappedSongs.filter(function (t) {
                return t.name.toLowerCase().includes(interaction.options.getString('song').toLowerCase());
            }).splice(0, 24));
            return [2 /*return*/];
        });
    });
}
var options = [
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
];
exports["default"] = {
    description: 'plays a song in the slected channel',
    command: command,
    autocompleate: autocompleate,
    name: 'play',
    options: options,
    id: 'util.play',
    defaultPermition: true
};
