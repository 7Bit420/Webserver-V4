var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')

const elementRegstarySymbol = Symbol("elementRegstary")

class GAMEAPI {

    [elementRegstarySymbol] = new Map()

    //#region COMPONENT

    static component = class component extends EventTarget {

        constructor() {
            super()

            this.id = "xxxxx-xxxx-xxx-xxxx-xxxxx".replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
            Object.freeze(this.id)
        }

    }

    //#endregion

    //#region FRAME CLASS

    static Frame = class Frame extends this.component {
        canvas = document.createElement('canvas')
        name = "UNKNOWN"

        constructor(name, res) { 
            super(); 
            this.name = name 
            this.canvas.width = res * window.innerWidth
            this.canvas.height = res * window.innerHeight
        }
    }

    //#endregion

    //#region BACKGROUND CLASS

    static Background = class Background extends this.Frame {
        #ctx = this.canvas.getContext('2d')
        #sorce

        constructor(sorce, name, res) {
            super(name, res)

            if (sorce instanceof HTMLVideoElement) {
                this.#sorce = sorce
                this.#sorce.loop = true
                this.#sorce.volume = 0
                this.#sorce.play()
                this.addEventListener('tick', () => {
                    this.#ctx.restore()
                    this.#ctx.fillRect(0, 0, this.#sorce.width, this.#sorce.height)
                })
            } else if (typeof sorce == "string") {
                this.#sorce = document.createElement('img')
                this.#sorce.src = sorce
                this.canvas = this.#sorce
                console.log("Img-str");
                this.addEventListener('tick', () => {
                    this.#ctx.restore()
                    this.#ctx.fillRect(0, 0, this.#sorce.width, this.#sorce.height)
                })
            } else if (sorce instanceof HTMLImageElement) {
                this.#sorce = sorce
                console.log("Img");
                this.addEventListener('tick', () => {
                    this.#ctx.restore()
                    this.#ctx.fillRect(0, 0, this.#sorce.width, this.#sorce.height)
                })
            } else if (sorce instanceof HTMLCanvasElement) {
                this.#sorce = sorce
                this.addEventListener('tick', () => {
                    this.#ctx.restore()
                    this.#ctx.fillRect(0, 0, this.#sorce.width, this.#sorce.height)
                })
            } else throw new TypeError('Sorce needs to be either one of HTMLVideoElement, HTMLImageElement, String or HTMLCanvasElement')
        }
    }

    //#endregion

    //#region GAME CLASS
    static Game = class Game extends EventTarget {
        #resalution = 1
        #width = window.innerWidth
        #height = window.innerHeight
        #canvasDim = { x: 0, y: 0 }

        #loop = 0

        canvas = document.createElement('canvas');
        #ctx = this.canvas.getContext('2d')
        #layers = {}
        layers = []

        //#region Res Updaters

        get resalution() {
            return this.#resalution;
        }

        get width() {
            return this.#width;
        }

        get height() {
            return this.#height;
        }

        set resalution(v) {
            this.#resalution = v;
            this.#height = this.#canvasDim.y * v;
            this.#width = this.#canvasDim.x * v;
            this.canvas.height = this.#height;
            this.canvas.width = this.#width;
        }

        set width(v) {
            this.#canvasDim.x = v;
            this.#width = this.#canvasDim.x * v;
            this.canvas.width = this.#width;
        }

        set height(v) {
            this.#canvasDim.y = v;
            this.#height = this.#canvasDim.y * v;
            this.canvas.height = this.#height;
        }

        //#endregion

        constructor(height, width, res) {
            super()
            this.#tick.bind(this)


            this.resalution ??= res;
            this.width ??= width;
            this.height ??= height;
            this.canvas.style.width = this.canvas.style.height = "100%"

            this.#loop = setInterval(() => this.#tick(), 16);
        }

        #tick() {
            this.dispatchEvent(new Event('tick'))
            this.#ctx.restore()
            this.layers.forEach(layer => this.#ctx.drawImage(layer, 0, 0, this.canvas.width, this.canvas.height))
        }

        addLayer(frame) {
            if (!frame instanceof (GAMEAPI.Frame)) throw new TypeError('frame is not an instance of frame')
            this.layers.push(frame.canvas)
            this.#layers[frame.name] = frame
        }
    }

    //#endregion

}

for (const i in GAMEAPI) {
    if (GAMEAPI[i].prototype) {
        GAMEAPI[i].bind(Object.assign(this, GAMEAPI[i]))
    }
}
Object.freeze(GAMEAPI)

var game = new GAMEAPI.Game(undefined, undefined, 200)
game.addLayer(new GAMEAPI.Background("assets/background.jpg", "background", 20))

document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(game.canvas)
})

document.addEventListener('keydown', (key) => {

    switch (key.code) {
        case "KeyR":
            if (key.altKey) {
                location.reload()
            }
            break;
    }

})
