(async () => {

    class finishEvent extends Event {

        constructor(win) {
            super('finish')
            this.won = win
        }
    }

    class geuessUpdateEvent extends Event {

        constructor(guess, row) {
            super('update')
            this.row = row
            this.guess = guess
        }

    }

    class guessEvent extends Event {

        constructor(guess, row) {
            super('guess')
            this.row = row
            this.guess = guess
        }

    }

    class Wordle extends EventTarget {

        #elms = []
        #entrys = []
        #crntEntry = ''
        #tabel = document.createElement('table')
        #rows = 0
        #rowelms = []
        #word
        #wordInfo = {}
        #finished = false
        keyBoard = document.createElement('div')
        #charBoard = {}
        static #accpectedChars = 'abcdefghijklmnopqrstuvwxyz'
        static #words = ['hello']
        static get words() { return this.#words }
        static async fetchWords() {
            var req = new XMLHttpRequest();
            req.open('GET', 'word-list.txt')
            return new Promise((res) => {
                req.addEventListener('load', () => {
                    this.#words = req.responseText.split('\n')
                    res(this.#words)
                })
                req.send()
            })
        }

        constructor(word = 'hello', rows = 6) {
            super()

            this.#rows = rows
            this.#word = word

            const keyBoardLayers = [
                'qwertyuiop',
                'asdfghjkl',
                'zxcvbnm',
            ]
            for (const layer of keyBoardLayers) {
                var row = document.createElement('tr')
                for (const key of layer) {
                    var keyElm = document.createElement('td')
                    keyElm.innerText = key
                    this.#charBoard[key] = keyElm
                    keyElm.addEventListener('click', () => keydown(key))
                    row.appendChild(keyElm)
                }
                this.keyBoard.appendChild(row)
            }

            for (const d in word) {
                this.#wordInfo[word[d]] = (this.#wordInfo[word[d]] ? (this.#wordInfo[word[d]] + 1) : 1)
            }
            for (let i = 0; i < rows; i++) {
                var row = document.createElement('tr')
                this.#elms[i] = []

                for (let n = 0; n < word.length; n++) {
                    var elm = document.createElement('td')
                    this.#elms[i][n] = row.appendChild(elm)
                }

                this.#rowelms.push(row)
                this.#tabel.appendChild(row)
            }

            var keydown = (key) => {
                switch (key) {
                    case 'Enter':
                        if (this.#crntEntry.length >= word.length) {
                            if (Wordle.#words.includes(this.#crntEntry)) {
                                if (!(this.#entrys.length == this.#rows)) {
                                    this.dispatchEvent(new guessEvent(this.#crntEntry, this.#entrys.length))
                                    this.#entrys.push(this.#crntEntry)
                                }
                                if (this.#crntEntry == this.#word) {
                                    this.#finished = true
                                    document.removeEventListener('keydown', keydown)
                                    this.dispatchEvent(new finishEvent(true))
                                    this.#crntEntry = ''
                                    alert('you win')
                                } else if (this.#entrys.length == this.#rows) {
                                    this.#finished = true
                                    document.removeEventListener('keydown', keydown)
                                    this.dispatchEvent(new finishEvent(false))
                                    alert('You Lose!!!! LLLLLL')
                                }
                                this.#updateDisplay()
                                this.#updateKeyBoard()
                                if (!(this.#entrys.length == this.#rows)) {
                                    this.#crntEntry = ''
                                }
                            } else {
                                alert('not a word')
                            }
                        } else {
                            alert('word not big enough')
                        }
                        break;
                    case 'Backspace':
                        this.#crntEntry = this.#crntEntry.substring(0, this.#crntEntry.length - 1)
                        this.dispatchEvent(new geuessUpdateEvent(this.#crntEntry, this.#entrys.length))
                        break;
                    default:
                        if (Wordle.#accpectedChars.includes(key)) {
                            if (this.#crntEntry.length < word.length) {
                                this.#crntEntry += key
                                this.dispatchEvent(new geuessUpdateEvent(this.#crntEntry, this.#entrys.length))
                            }
                        }
                        break;
                }

                if (!this.#finished) {
                    this.#updateDisplay()
                }
            }

            document.addEventListener('keydown', key => keydown(key.key))

        }

        #updateDisplay() {
            for (let i = 0; i < this.#rows; i++) {
                var entryInfo = {}
                Object.assign(entryInfo, this.#wordInfo)
                var entry = (this.#entrys[i] ?? '')
                for (let n = 0; n < this.#word.length; n++) {
                    this.#elms[i][n].innerText = entry[n] ?? ''
                    var char = entry[n] ?? '|'
                    if (this.#word[n] == char) {
                        entryInfo[char]--;
                        this.#elms[i][n].style.background = 'green';
                    }
                }

                for (let n = 0; n < this.#word.length; n++) {
                    this.#elms[i][n].innerText = entry[n] ?? ''
                    var char = entry[n] ?? '|'
                    if (
                        this.#word.includes(char) &&
                        (entryInfo[char] > 0) &&
                        !this.#elms[i][n].style.background
                    ) {
                        entryInfo[char]--;
                        this.#elms[i][n].style.background = '#b59f3b';
                    }
                }

                for (let n = 0; n < this.#word.length; n++) {
                    this.#elms[i][n].innerText = entry[n] ?? ''
                    var char = entry[n] ?? '|'
                    if (
                        char != '|' &&
                        !this.#elms[i][n].style.background
                    ) {
                        this.#elms[i][n].style.background = 'grey'
                    }
                }

            }
            if (!this.#finished) {
                for (let n = 0; n < this.#word.length; n++) {
                    this.#elms[Math.min(this.#rows, this.#entrys.length)][n].innerText = this.#crntEntry[n] ?? ''
                }
            }
        }

        #updateKeyBoard() {
            for (let n = 0; n < this.#word.length; n++) {
                var char = this.#crntEntry[n] ?? '|'
                if (!this.#word.includes(char) && (char != '|')) {
                    this.#charBoard[char].style.background = 'grey'
                }
                if (this.#word[n] == char && (char != '|')) {
                    this.#charBoard[char].style.background = 'green'
                }
            }
        }

        get tabel() {
            return this.#tabel
        }

    }

    class shaddowWordle {

        #elms = []
        entrys = []
        #tabel = document.createElement('table')
        #rows = 0
        #rowelms = []
        #word
        #wordInfo = {}

        constructor(word = 'hello', rows = 6) {
            this.#rows = rows
            this.#word = word

            for (const d in word) {
                this.#wordInfo[word[d]] = (this.#wordInfo[word[d]] ? (this.#wordInfo[word[d]] + 1) : 1)
            }
            for (let i = 0; i < rows; i++) {
                var row = document.createElement('tr')
                this.#elms[i] = []

                for (let n = 0; n < word.length; n++) {
                    var elm = document.createElement('td')
                    this.#elms[i][n] = row.appendChild(elm)
                }

                this.#rowelms.push(row)
                this.#tabel.appendChild(row)
            }

        }

        updateDisplay() {
            for (let i = 0; i < this.#rows; i++) {
                var entryInfo = {}
                Object.assign(entryInfo, this.#wordInfo)
                var entry = (this.entrys[i] ?? '')

                for (let n = 0; n < this.#word.length; n++) {
                    var char = entry[n] ?? '|'
                    if (this.#word[n] == char) {
                        entryInfo[char]--;
                        this.#elms[i][n].style.background = 'green';
                    }
                }

                for (let n = 0; n < this.#word.length; n++) {
                    var char = entry[n] ?? '|'
                    if (
                        this.#word.includes(char) &&
                        (entryInfo[char] > 0) &&
                        !this.#elms[i][n].style.background
                    ) {
                        entryInfo[char]--;
                        this.#elms[i][n].style.background = '#b59f3b';
                    }
                }

                for (let n = 0; n < this.#word.length; n++) {
                    var char = entry[n] ?? '|'
                    if (
                        char != '|' &&
                        !this.#elms[i][n].style.background
                    ) {
                        this.#elms[i][n].style.background = 'grey'
                    }
                }
            }
        }

        get tabel() {
            return this.#tabel
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await Wordle.fetchWords()

        var wordle = new shaddowWordle()
        document.getElementById('wordle').replaceWith(wordle.tabel)

        document.getElementById('create').addEventListener('click', async () => {
            var gameID = ''
            var req = new XMLHttpRequest()
            req.open('GET', '/games/wordle/create')
            await new Promise((res, reg) => {
                req.addEventListener('load', () => {
                    gameID = req.responseText
                    res()
                })
                req.send()
            })

            var gameSocket = new WebSocket(`ws://${location.hostname}/games/wordle/${gameID}`)
            var shaddows = {}
            var clid = ''

            gameSocket.addEventListener('message', (data) => {
                try {
                    var msg = JSON.parse(data.data)
                } catch (err) { return }

                switch (msg.type) {
                    case 'start':
                        startButton.remove()
                        var newWordle = new Wordle(msg.word)
                        wordle.tabel.replaceWith(newWordle.tabel)
                        wordle = newWordle

                        wordle.keyBoard.id = 'controls'
                        wordle.keyBoard.classList.add('keyboard')

                        document.getElementById('controls').replaceWith(wordle.keyBoard)

                        wordle.addEventListener('guess', (ev) => {
                            gameSocket.send(JSON.stringify({
                                type: 'guess',
                                row: ev.row,
                                guess: ev.guess
                            }))
                        })
                        wordle.addEventListener('finish', (ev) => {
                            gameSocket.send(JSON.stringify({
                                type: 'finish',
                                won: ev.won
                            }))
                        })
                        clid = msg.clid
                        for (var clientInfo of msg.clients) {
                            console.log(clientInfo)
                            if (clientInfo.clid == clid) continue;
                            shaddows[clientInfo.clid] = {}
                            shaddows[clientInfo.clid].wordle = new shaddowWordle(msg.word)
                            document.getElementById('shadowContainer').appendChild(shaddows[clientInfo.clid].wordle.tabel)
                        }
                        break;
                    case 'guess':
                        if (msg.clid == clid) return;
                        shaddows[msg.clid].wordle.entrys[msg.row] = msg.guess
                        shaddows[msg.clid].wordle.updateDisplay()
                        break;
                    case 'end':
                        alert('game finished')
                        break;
                }
            })

            var controlsBox = document.createElement('div')
            controlsBox.classList.add('menu')
            controlsBox.id = 'controls'

            var startButton = document.createElement('button')
            startButton.innerText = 'Start'
            controlsBox.appendChild(startButton)

            var idElm = document.createElement('button')
            idElm.innerText = 'Code: ' + gameID
            controlsBox.appendChild(idElm)

            document.getElementById('controls').replaceWith(controlsBox)

            startButton.addEventListener('click', (ev) => {
                gameSocket.send(JSON.stringify({
                    type: 'start'
                }))
            })
        })

        document.getElementById('join').addEventListener('click', () => {
            var controlsBox = document.createElement('div')
            controlsBox.classList.add('menu')
            controlsBox.id = 'controls'

            var joinButton = document.createElement('button')
            joinButton.innerText = 'Join'
            controlsBox.appendChild(joinButton)

            var idImput = document.createElement('input')
            idImput.type = 'text'
            idImput.placeholder = 'Code'
            controlsBox.appendChild(idImput)

            document.getElementById('controls').replaceWith(controlsBox)

            joinButton.addEventListener('click', async () => {
                var gameID = idImput.value
                try {
                    var gameSocket = new WebSocket(`ws://${location.hostname}/games/wordle/${gameID}`)
                } catch (err) {
                    console.log(err)
                }
                var shaddows = {}
                var clid = ''

                await new Promise(async res => {
                    var initMsg = await new Promise(res => gameSocket.addEventListener('message', (msg) => {
                        res(JSON.parse(msg.data))
                    }, { once: true }))
                    switch (initMsg.code) {
                        case 1:
                            alert('Too Many Clients')
                            location.reload()
                            break;
                        case 2:
                            alert('Bad Code')
                            location.reload()
                            break;
                        case 3:
                            var controlsBox = document.createElement('div')
                            controlsBox.classList.add('menu')
                            controlsBox.id = 'controls'
                            document.getElementById('controls').replaceWith(controlsBox)

                            gameSocket.addEventListener('message', (data) => {
                                try {
                                    var msg = JSON.parse(data.data)
                                } catch (err) { return }

                                switch (msg.type) {
                                    case 'start':
                                        var newWordle = new Wordle(msg.word)
                                        wordle.tabel.replaceWith(newWordle.tabel)
                                        wordle = newWordle

                                        wordle.keyBoard.id = 'controls'
                                        wordle.keyBoard.classList.add('keyboard')

                                        document.getElementById('controls').replaceWith(wordle.keyBoard)

                                        wordle.addEventListener('guess', (ev) => {
                                            gameSocket.send(JSON.stringify({
                                                type: 'guess',
                                                row: ev.row,
                                                guess: ev.guess
                                            }))
                                        })
                                        wordle.addEventListener('finish', (ev) => {
                                            gameSocket.send(JSON.stringify({
                                                type: 'finish',
                                                won: ev.won
                                            }))
                                        })
                                        clid = msg.clid
                                        for (var clientInfo of msg.clients) {
                                            console.log(clientInfo)
                                            if (clientInfo.clid == clid) continue;
                                            shaddows[clientInfo.clid] = {}
                                            shaddows[clientInfo.clid].wordle = new shaddowWordle(msg.word)
                                            var shaddow = document.getElementById('shadowContainer').appendChild(shaddows[clientInfo.clid].wordle.tabel)
                                            shaddow.classList.add('shaddow')
                                        }
                                        break;
                                    case 'guess':
                                        if (msg.clid == clid) return;
                                        shaddows[msg.clid].wordle.entrys[msg.row] = msg.guess
                                        shaddows[msg.clid].wordle.updateDisplay()
                                        break;
                                    case 'end':
                                        alert('game finished')
                                        break;
                                }
                            })
                            break;
                    }
                })
            })
        })
    })
})()

