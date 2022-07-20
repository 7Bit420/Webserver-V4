const fs = require('fs')

class logger {

    #dirpath = "./logs"
    #writeIndex = 0
    #date = new Date()

    logError(err = Error.prototype) {
        this.#date = new Date(Date.now())
        var errorPath = `${this.#dirpath}/errors/${err.name} [${this.#date.toUTCString()}]`
        fs.appendFileSync(
            this.#dirpath + '/main.log',
            "\n[" + this.#date.getSeconds().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMinutes().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getHours().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getDay().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMonth().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getFullYear().toString(10).padStart('0', 4).slice(0, 4) + "]"
            + " ERROR: Full report of error: \"" + err.message + "\" can be found at \"" + errorPath + "\""
        )

        fs.writeFileSync(errorPath, `ERROR: ${err.name}\nMESSAGE: ${err.message}\nSTACK: ${err.stack || "Unknown"}`)
    }

    logInfo(message = "") {
        this.#date = new Date(Date.now())
        fs.appendFileSync(
            this.#dirpath + '/main.log',
            "\n[" + this.#date.getSeconds().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMinutes().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getHours().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getDay().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMonth().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getFullYear().toString(10).padStart('0', 4).slice(0, 4) + "]"
            + " INFO : " + message
        )
    }

    logDebug(message = "") {
        this.#date = new Date(Date.now())
        fs.appendFileSync(
            this.#dirpath + '/main.log',
            "\n[" + this.#date.getSeconds().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMinutes().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getHours().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getDay().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMonth().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getFullYear().toString(10).padStart('0', 4).slice(0, 4) + "]"
            + " DEBUG: " + message
        )
    }

    logWarn(message = "") {
        this.#date = new Date(Date.now())
        fs.appendFileSync(
            this.#dirpath + '/main.log',
            "\n[" + this.#date.getSeconds().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMinutes().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getHours().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getDay().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMonth().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getFullYear().toString(10).padStart('0', 4).slice(0, 4) + "]"
            + " WARN : " + message
        )
    }

    log(message = "") {
        this.#date = new Date(Date.now())
        fs.appendFileSync(
            this.#dirpath + '/main.log',
            "\n[" + this.#date.getSeconds().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMinutes().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getHours().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getDay().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getMonth().toString(10).padStart('0', 2).slice(0, 2) + ":"
            + this.#date.getFullYear().toString(10).padStart('0', 4).slice(0, 4) + "]"
            + " LOG  : " + message
        )
    }

    constructor(dirpath) {
        this.#dirpath = dirpath
        this.#date = new Date()

        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath)
        }

        if (!fs.existsSync(dirpath + '/errors')) {
            fs.mkdirSync(dirpath + '/errors')
        }

        fs.appendFile(
            this.#dirpath + '/main.log',
            `\n\n|----| LOGGER START AT ${this.#date.toUTCString()} |----| \n\n`
        )
    }
}

if (require.main == module) {
    var log = new logger("./test")

    log.logError(new Error("this is a test error"))
    log.logInfo("This is a info log")
    log.logDebug("This is a Debug log")
    log.logWarn("This is a Warn log")
    log.log("This is a normal log")
}

module.exports = logger