
class gui {

    x = 0;
    y = 0;
    out = [['']];

    /**
     * 
     * @param {NodeJS.Process} process 
     */
    constructor(process) {

        process.stdin.setRawMode(true)

        this.x = process.stdout.getWindowSize()[0];
        this.y = process.stdout.getWindowSize()[1];

        this.out = (new Array(this.y)).fill((new Array(this.x)).fill(' '));

        this.out[0][0] = 'x'
        this.out[0][1] = 'y'

        console.log(this.out.map(t => t.join('')).join('\n'))
        // console.log(this.out)


    }
}

class Terminal {

    constructor() { }
}

class Component {

    width = 0
    height = 0
    x = 0
    y = 0

    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.height = height
        this.width = width
    }
}

class guiManager {

    #idMap = new Map()
    #components = [Component.prototype]
    #terminal = Terminal.prototype
    #stdin = process.stdin
    #stdout = process.stdout
    #bounds = {}

    static #genId() {
        return 'xxxxx-xxxx-xxx-xxxx-xxxxx'.replace(/x/g, t => String.fromCharCode(61 + Math.floor(Math.random() * 26)))
    }
    static #idSymbol = Symbol('id')
    #within(a, x, b) {
        return (a < x) && (x < b)
    }

    constructor(
        stdout = process.stdout,
        stdin = process.stdin
    ) {

    }

    setTerminal(terminal) {

    }

    /**
     * @param {Component} component 
     */
    addCompnent(component) {
        if (
            this.#components.some(c => console.log(
                this.#within(c.x, component.x, c.x + c.width),
                this.#within(c.x, component.x + component.width, c.x + c.width),
                this.#within(c.y, component.y, c.y + c.height),
                this.#within(c.y, component.y + component.height, c.x + c.width)
            ))
        ) {
            component[guiManager.#idSymbol] = guiManager.#genId()
            this.#idMap.set(component[guiManager.#idSymbol], component)
            this.#components.push(component)
        } else throw new TypeError('Intersects with another element')

    }
    removeComponent(id) {

    }

    #render() { }
}

var mgr = new guiManager()

var c1 = new Component(10, 10, 0, 0)
var c2 = new Component(10, 10, 11, 0)

mgr.addCompnent(c1)
mgr.addCompnent(c2)
