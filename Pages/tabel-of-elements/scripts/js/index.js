(async () => {
    var req = new XMLHttpRequest()

    req.open('GET', 'assets/tabel.json')
    req.send()

    await new Promise(res => req.onload = res)

    const res = JSON.parse(req.responseText)

    var width = 0
    var height = 0

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

            elementElm.style.gridColumn = (i + 1).toString()
            elementElm.style.gridRow = (n + 1).toString()

            elementElm.classList.add('element')

            if (element.thin) {
                localHeight += 0.5
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

            elementElm.append(name, symbol, info, shell)
            elementElm.style.background = colourMap[element.cat] || ''

            groupElm.appendChild(elementElm)
        }
        if (localHeight > height) height = localHeight;
        document.getElementById('tabel').appendChild(groupElm)
    }

    document.body.style.setProperty('--coloums', width)
    document.body.style.setProperty('--rows', height)

    function upddateBounds() {
        console.clear()
        console.group('Bounds')
        console.info('Width', width)
        console.info('Height', height)
        console.groupEnd()
        if ((innerWidth / width) < (innerHeight / height)) {
            document.body.style.setProperty('--elm-size', `${Math.round(innerWidth / width) - 8}px`)
        } else {
            document.body.style.setProperty('--elm-size', `${Math.round(innerHeight / height) - 8}px`)

        }
    }

    upddateBounds()
    document.addEventListener('resize', () => upddateBounds())
})()