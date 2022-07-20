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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var e_1, _a;
var _b;
exports.__esModule = true;
var discord_js_1 = __importDefault(require("discord.js"));
var uuid = __importStar(require("uuid"));
var fs_1 = __importDefault(require("fs"));
var ws_1 = __importDefault(require("ws"));
var t = __dirname.split('/');
var rootPath = t.splice(0, t.length - 1).join('/');
delete globalThis.t;
var manifiest = JSON.parse(fs_1["default"].readFileSync(rootPath + '/config/manifest.json').toString('ascii'));
globalThis.config = JSON.parse(fs_1["default"].readFileSync(rootPath + '/config/config.json').toString('ascii'));
var clid = "discord-bot";
var commandManifiest = (_b = manifiest === null || manifiest === void 0 ? void 0 : manifiest.commands) !== null && _b !== void 0 ? _b : {};
var commands = new Map();
var commandIdMap = new Map();
var client = new discord_js_1["default"].Client({
    intents: globalThis.config.intents
});
Object.assign(globalThis.config, {
    commands: commands,
    client: client,
    commandManifiest: commandManifiest,
    commandIdMap: commandIdMap,
    dirname: __dirname
});
//#region wsClient
globalThis.creq = function (target, data, type) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, reg) {
                    var id = uuid.v4();
                    var wait = function (d) {
                        var _a, _b;
                        console.log(JSON.parse(d.data));
                        try {
                            d = JSON.parse(((_a = d === null || d === void 0 ? void 0 : d.data) !== null && _a !== void 0 ? _a : d).toString('ascii'));
                        }
                        catch (err) {
                            return;
                        }
                        globalThis.wsClient.removeEventListener("message", wait);
                        if (((_b = d === null || d === void 0 ? void 0 : d.head) === null || _b === void 0 ? void 0 : _b.id) == id) {
                            res(d);
                        }
                    };
                    globalThis.wsClient.addEventListener('message', wait);
                    globalThis.wsClient.send(JSON.stringify({
                        head: {
                            id: id,
                            target: target,
                            origin: clid,
                            type: type
                        },
                        body: data
                    }));
                })];
        });
    });
};
globalThis.wsClient = new ws_1["default"].WebSocket('ws://localhost:5200', {
    headers: {
        id: clid
    },
    host: 'localhost',
    port: 5200,
    protocol: 'ws'
});
globalThis.wsClient.addEventListener('close', onDisconect);
function onDisconect() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setTimeout(reconect, 1000);
            return [2 /*return*/];
        });
    });
}
function reconect() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(globalThis.wsClient.readyState <= 2)) return [3 /*break*/, 2];
                    globalThis.wsClient = new ws_1["default"].WebSocket('ws://localhost:5200', {
                        headers: {
                            id: "database-v2"
                        },
                        host: 'localhost',
                        port: 5200,
                        protocol: 'ws'
                    });
                    return [4 /*yield*/, new Promise(function (res, reg) {
                            setTimeout(res, 5000);
                            globalThis.wsClient.addEventListener('close', res);
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2:
                    globalThis.wsClient.addEventListener('close', onDisconect);
                    return [2 /*return*/];
            }
        });
    });
}
//#endregion
//#region init
var initI = false;
process.stdin.on('data', function (data) {
    try {
        data = JSON.parse(data.toString('ascii'));
    }
    catch (err) {
        return;
    }
    switch (data.type) {
        case "setConfig":
            globalThis.config = Object.assign(globalThis.config, data.body.config);
            break;
    }
});
function updateStatus(code) {
    process.stdout.write(JSON.stringify({
        type: "statusUpdate",
        body: {
            state: code
        }
    }));
}
try {
    //#endregion
    for (var _c = __values(fs_1["default"].readdirSync(__dirname + '/event-listners').filter(function (t) { return t.endsWith('.js'); })), _d = _c.next(); !_d.done; _d = _c.next()) {
        var listnerPath = _d.value;
        var listner = require(__dirname + '/event-listners/' + listnerPath)["default"];
        client.on(listner.event, listner.listner);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
    }
    finally { if (e_1) throw e_1.error; }
}
client.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var commandIds, _loop_1, discordCommand, _a, _b, commandPath, e_2_1, _c, _d, c, e_3_1;
    var e_2, _e, e_3, _f;
    var _g;
    var _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                commandIds = [];
                return [4 /*yield*/, client.application.commands.fetch()];
            case 1:
                _j.sent();
                _loop_1 = function (commandPath) {
                    var command, _k;
                    return __generator(this, function (_l) {
                        switch (_l.label) {
                            case 0:
                                command = require(__dirname + '/commands/' + commandPath)["default"];
                                commands.set(command.id, command);
                                (_g = commandManifiest[_h = command.id]) !== null && _g !== void 0 ? _g : (commandManifiest[_h] = {});
                                if (!(typeof commandManifiest[command.id].id == 'string')) return [3 /*break*/, 1];
                                discordCommand = client.application.commands.cache.find(function (c) { return c.id == commandManifiest[command.id].id; });
                                discordCommand.setOptions(command.options);
                                discordCommand.setDefaultPermission(command.defaultPermission || false);
                                commandIdMap.set(commandManifiest[command.id].id, command.id);
                                commandIds.push(commandManifiest[command.id].id);
                                return [3 /*break*/, 3];
                            case 1:
                                _k = commandManifiest[command.id];
                                return [4 /*yield*/, client.application.commands.create({
                                        name: command.name,
                                        description: command.description,
                                        type: 'CHAT_INPUT',
                                        options: command.options,
                                        defaultPermission: command.defaultPermission
                                    })];
                            case 2:
                                _k.id = (_l.sent()).id;
                                commandIdMap.set(commandManifiest[command.id].id, command.id);
                                commandIds.push(commandManifiest[command.id].id);
                                _l.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _j.label = 2;
            case 2:
                _j.trys.push([2, 7, 8, 9]);
                _a = __values(fs_1["default"].readdirSync(__dirname + '/commands').filter(function (t) { return t.endsWith('.js'); })), _b = _a.next();
                _j.label = 3;
            case 3:
                if (!!_b.done) return [3 /*break*/, 6];
                commandPath = _b.value;
                return [5 /*yield**/, _loop_1(commandPath)];
            case 4:
                _j.sent();
                _j.label = 5;
            case 5:
                _b = _a.next();
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 9];
            case 7:
                e_2_1 = _j.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 9];
            case 8:
                try {
                    if (_b && !_b.done && (_e = _a["return"])) _e.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 9:
                _j.trys.push([9, 14, 15, 16]);
                _c = __values(client.application.commands.cache.filter(function (c) { return !commandIds.includes(c.id); })), _d = _c.next();
                _j.label = 10;
            case 10:
                if (!!_d.done) return [3 /*break*/, 13];
                c = _d.value;
                return [4 /*yield*/, c[1]["delete"]()];
            case 11:
                _j.sent();
                _j.label = 12;
            case 12:
                _d = _c.next();
                return [3 /*break*/, 10];
            case 13: return [3 /*break*/, 16];
            case 14:
                e_3_1 = _j.sent();
                e_3 = { error: e_3_1 };
                return [3 /*break*/, 16];
            case 15:
                try {
                    if (_d && !_d.done && (_f = _c["return"])) _f.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
                return [7 /*endfinally*/];
            case 16:
                Object.assign(globalThis.config, {
                    client: undefined
                });
                fs_1["default"].writeFileSync(rootPath + '/config/manifest.json', JSON.stringify(globalThis.config));
                globalThis.config.client = client;
                process.stdout.write(JSON.stringify({
                    type: "getConfig"
                }));
                setTimeout(function () {
                    updateStatus(200);
                });
                return [2 /*return*/];
        }
    });
}); });
client.on('error', function (err) {
    updateStatus(500);
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, p, n;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.login(globalThis.config.token)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                p = true;
                n = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, client.login(globalThis.config.token)];
                            case 1:
                                _a.sent();
                                clearInterval(n);
                                return [3 /*break*/, 3];
                            case 2:
                                error_2 = _a.sent();
                                if (p) {
                                    updateStatus(500);
                                    p = false;
                                }
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }, 1000 * 10);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
