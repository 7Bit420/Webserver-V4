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
exports.__esModule = true;
var discord = __importStar(require("discord.js"));
function command(commandInteraction) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var _b, modial, user, user, user, userInfo, embed;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = commandInteraction.options.getSubcommand() || commandInteraction.options.getSubcommandGroup();
                    switch (_b) {
                        case "bind": return [3 /*break*/, 1];
                        case 'me': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 11];
                case 1: return [4 /*yield*/, commandInteraction.showModal({
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
                    })];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, commandInteraction.awaitModalSubmit({ time: 10 * 1000 })];
                case 3:
                    modial = (_c.sent());
                    console.log('submit');
                    return [4 /*yield*/, globalThis.creq('database-v2', {
                            query: {
                                username: modial.fields.getTextInputValue('username') || {},
                                password: modial.fields.getTextInputValue('password') || {}
                            },
                            database: "User-A"
                        }, 'findShelf')];
                case 4:
                    user = (_c.sent()).body.user;
                    console.log('found');
                    return [4 /*yield*/, globalThis.creq('database-v2', {
                            database: "User-A",
                            id: user.id,
                            container: {
                                id: commandInteraction.user.id
                            },
                            containerName: "discord"
                        }, 'editContainer')];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, globalThis.creq('database-v2', {
                            database: "User-A",
                            id: user.id,
                            container: {
                                discordId: commandInteraction.user.id
                            },
                            containerName: "index"
                        }, 'editContainer')];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, globalThis.creq('database-v2', {
                            container: {
                                balance: 10000,
                                stocks: {},
                                items: [],
                                bio: 'This user has no Bio'
                            },
                            id: user.id,
                            database: "User-A",
                            containerName: "info"
                        }, 'editContainer')];
                case 7:
                    user = (_c.sent());
                    console.log('updated');
                    modial.reply({ content: "Succesfuly Bound To " + user.body.username, ephemeral: true });
                    return [3 /*break*/, 12];
                case 8: return [4 /*yield*/, globalThis.creq('database-v2', {
                        query: {
                            discordId: commandInteraction.user.id
                        },
                        database: "User-A"
                    }, 'findShelf')];
                case 9:
                    user = (_c.sent());
                    if (!user.body.user) {
                        commandInteraction.reply({ content: "Cannot find user" });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, globalThis.creq('database-v2', {
                            id: user.body.user.id,
                            database: "User-A",
                            container: "info"
                        }, 'getContainer')];
                case 10:
                    userInfo = (_c.sent()).body.container;
                    embed = new discord.MessageEmbed({
                        title: "".concat(user.body.user.username),
                        description: userInfo.bio,
                        thumbnail: {
                            url: (_a = userInfo.pfp) !== null && _a !== void 0 ? _a : commandInteraction.user.avatarURL({ size: 1024 }),
                            height: 1024,
                            width: 1024
                        }
                    });
                    commandInteraction.reply({ embeds: [embed] });
                    return [3 /*break*/, 12];
                case 11: return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
var options = [
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
];
exports["default"] = {
    description: 'description',
    command: command,
    name: 'orion',
    options: options,
    id: 'orion.orion'
};
