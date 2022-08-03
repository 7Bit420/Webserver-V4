(async () => {

    Object.defineProperty(globalThis, 'isChild', {
        value: Boolean(top),
        configurable: false,
        writable: false,
        enumerable: false
    })

    if (isChild) {

    } else {

    }
})()

export class client {

}

class parent {

    /**
     * @member {Object<String>} modules 
     */
    modules = {}

    /**
     * 
     */
    #getModules() {
        document.querySelectorAll('iframe').forEach(t => {
            if (
                t.hasAttribute('module') &&
                !this.modules[t.getAttribute('module')]
            ) {
                this.modules[t.getAttribute('module')] = t
                t.contentWindow.addEventListener('message', console.log)
            }
        })
    }

    /**
     * 
     * @param {MessageEvent} ev 
     */
    #handleRequest(ev) {
        var module = this.modules[ev.source.frameElement.getAttribute('module')]
        if (module) {
            console.log(module)
        } else {
            console.log(ev.source)
        }
    }

    /**
     * 
     */
    async #init() {
        this.#getModules()
        window.addEventListener('message', console.log)
    }

    constructor() {
        this.#init()
    }
}
window.addEventListener('message', console.log)
new parent()

export { parent }