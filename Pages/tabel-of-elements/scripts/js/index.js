import * as bridge from '/scripts/js/bridge.js'

(async () => {
    var client = new bridge.client('codex.tabel-of-elements.tabel')
    var req1 = new XMLHttpRequest()

    req1.open('GET', 'assets/tabel.json')
    req1.send()

    await new Promise(res => req1.onload = res)

    var res = JSON.parse(req1.responseText)

    var client = new bridge.client('codex.tabel-of-elements.tabel')
    var req2 = new XMLHttpRequest()

    req2.open('GET', 'assets/elminfo.json')
    req2.send()

    await new Promise(res => req2.onload = res)

    const elmInfo = JSON.parse(req2.responseText)

    var width = 1
    var height = 1

    const colourMap = {
        'Reactive nonmetals': '#2a4165',
        'Alcline earth metals': '#622e39',
        'Alcline metals': '#244d57',
        'Transition metals': '#433c65',
        'Post-transition metals': '#2f4d47',
        'Metalloids': '#523e1b',
        'Nonmetals': '#2a4165',
        'Noble gases': '#623842',
        'Lanthanides': '#004a77',
        'Actinides': '#613b28',
    }

    for (let i = 0; i < res.length; i++) {
        var groupElm = document.createElement('div')
        groupElm.style.gridColumn = (i + 1).toString()
        groupElm.classList.add('group')
        width += 1
        var localHeight = 0
        for (let n = 0; n < res[i].elements?.length; n++) {
            var element = res[i].elements[n]
            var elementElm = document.createElement('div')

            elementElm.style.setProperty('--coloum', (i + 1).toString())
            elementElm.style.setProperty('--row', (n + 1).toString())

            elementElm.classList.add('element')

            if (element.thin) {
                localHeight += 1
                elementElm.classList.add('thin')
            } else { localHeight += 1 }

            if (element.transperent) { elementElm.classList.add('transperent') }

            var name = document.createElement('div')
            name.classList.add('name')
            name.innerHTML = element.name

            var symbol = document.createElement('div')
            symbol.classList.add('symbol')
            symbol.innerHTML = element.symbol

            var info = document.createElement('div')
            info.classList.add('info')
            info.innerHTML = `${element.atn}`

            var shell = document.createElement('div')
            shell.classList.add('shell')
            
            elementElm.append(info, symbol, name, shell)
            elementElm.style.background = colourMap[element.cat] || ''
            
            if (!(element.thin || element.transperent)) {
                shell.innerText = elmInfo[element.atn].shells.join('\n')
                ;(async (element, elementElm) => {
                    elementElm.addEventListener('mousedown', () => {
                        client.send({ atn: element.atn, clicked: true }, 'codex.tabel-of-elements.viewer')
                    })

                    elementElm.addEventListener('mouseover', () => {
                        client.send({ atn: element.atn, clicked: false }, 'codex.tabel-of-elements.viewer')
                    })
                })(element, elementElm)
            }

            groupElm.appendChild(elementElm)
        }
        if (localHeight > height) height = localHeight;
        document.getElementById('tabel').appendChild(groupElm)
    }

    document.body.style.setProperty('--coloums', width)
    document.body.style.setProperty('--rows', height)

    async function updateBounds() {
        /*
        console.clear()
        await new Promise(r=>setTimeout(r,100))
        console.group('Bounds')
        console.info('Width', width)
        console.info('Height', height)
        console.groupEnd()
        //*/
        var elmSize = 0
        var ratio = width / height
        window.frameElement?.style?.setProperty('--prevered-ratio', ratio)
        if ((innerWidth / innerHeight) < ratio) {
            elmSize = (Math.round(innerWidth / width) - 8)
        } else {
            elmSize = (Math.round(innerHeight / height) - 8)
        }
        document.body.style.width = `${innerWidth - elmSize}px`
        document.body.style.height = `${innerHeight - elmSize}px`
        document.body.style.setProperty('--elm-size', `${elmSize}px`)
    }

    updateBounds()
    document.addEventListener('resize', () => updateBounds())

    globalThis.update = updateBounds
})()

