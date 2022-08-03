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

class client extends EventTarget {

    #id = ''

    #genid() {
        return 'xxxxx-xxxx-xxx-xxxx-xxxxx'.replace(/x/g, () => String.fromCharCode(
            Math.floor(Math.random() * 26) + 97))
    }

    send(data, target) {
        window.top.postMessage({
            head: {
                id: this.#genid(),
                origin: this.#id,
                target: target,
                type: 'request'
            },
            body: data
        })
    }

    #handleRequest(ev) {
        var data = ev.data

        var reqId = data.head?.id

        if (!reqId) { return }

        var id = this.#id

        function reply(data, success = true) {
            ev.source.postMessage({
                head: {
                    id: reqId,
                    origin: id,
                    target: reqId,
                    type: success ? 'reply' : 'error'
                },
                body: data
            })
        };

        Object.assign(data.head, {
            origin: this.#id,
            target: undefined
        })

        this.dispatchEvent(new dataEvent(data.body, reply))
    }

    constructor(id) {
        super()
        this.#id = id
        window.addEventListener('message', (...args) => this.#handleRequest(...args))
    }
}

class dataEvent extends Event {

    constructor(data, replyHandle) {
        super('message')
        this.data = data
        this.reply = replyHandle
    }
}

class parent extends EventTarget {

    /**
     * @member {Object<String>} modules 
     */
    #modules = {}

    /**
     * 
     */
    #getModules() {
        document.querySelectorAll('iframe').forEach(t => {
            if (
                t.hasAttribute('module') &&
                !this.#modules[t.getAttribute('module')]
            ) {
                this.#modules[t.getAttribute('module')] = t
            }
        })
    }

    /**
     * 
     * @param {MessageEvent} ev 
     */
    #handleRequest(ev) {
        var data = ev.data

        var moduleId = ev.source?.frameElement?.getAttribute('module')
        var module = this.#modules[moduleId]
        if (!module) return;
        
        var reqId = data.head?.id
        var target = data.head?.target

        var reply = function (data, success = true) {
            ev.source.postMessage({
                head: {
                    id: reqId,
                    origin: moduleId,
                    type: success ? 'reply' : 'error'
                },
                body: data
            })
        }

        if (!reqId) { return }
        if (!target) {
            this.dispatchEvent(new dataEvent(data.body, reply))
            return
        }

        if (!this.#modules[target]) {
            reply({ code: 404, message: 'invalad target id' }, false)
            return
        }

        Object.assign(data.head, {
            origin: moduleId,
            target: undefined
        })

        this.#modules[target].contentWindow.postMessage(data, '*')
    }

    constructor() {
        super()
        this.#getModules()
        window.addEventListener('message', (...args) => this.#handleRequest(...args))
    }
}

export { parent, client }