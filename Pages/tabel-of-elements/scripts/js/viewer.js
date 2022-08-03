import * as bridge from '/scripts/js/bridge.js'

(async () => {
    var client = new bridge.client()

    var req1 = new XMLHttpRequest()

    req1.open('GET', 'assets/elminfo.json')
    req1.send()

    await new Promise(res => req1.onload = res)

    const info = JSON.parse(req1.responseText)

    var req2 = new XMLHttpRequest()

    req2.open('GET', 'assets/descriptions.json')
    req2.send()

    await new Promise(res => req2.onload = res)

    const descriptions = JSON.parse(req2.responseText)

    const ratio = 2

    document.body.style.setProperty('--ratio', ratio.toString())

    var statElms = {
        atomic_mass: document.getElementById('atomic_mass').querySelector('.value'),
        boiling_points: document.getElementById('boiling_points').querySelector('.value'),
        density: document.getElementById('density').querySelector('.value'),
        melting_point: document.getElementById('melting_point').querySelector('.value'),
        molar_heat: document.getElementById('molar_heat').querySelector('.value'),
        name: document.getElementById('name'),
        symbol: document.getElementById('symbol'),
        number: document.getElementById('atn'),
    }

    var otherElms = {
        name: document.getElementById('title'),
        model: document.getElementById('model'),
        icon: document.getElementById('icon'),
        description: document.getElementById('description'),
        shells: document.getElementById('shells').querySelector('.value'),
    }

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

    function updateElm(atn, model = false) {
        for (const i in statElms) {
            statElms[i].innerText = info[atn]?.[i] ?? 'Unknown'
        }
        otherElms.name.innerText = info[atn].name
        otherElms.icon.style.background = colourMap[info[atn].cat]
        otherElms.description.innerText = descriptions[atn].description
        otherElms.shells.innerText = info[atn].shells.join(', ')
        if (model) {
            updateModel(atn)
        }
    }

    function updateModel(atn) {
        otherElms.model.setAttribute('src', info[atn].elem_model)
    }

    var atn = new URLSearchParams(location.search).get('atn')
    client.addEventListener('message', (ev) => {
        if (!ev.data.atn) console.log(ev)
        updateElm(ev.data.atn, ev.data.clicked)
    })
    if (
        !info[atn]
    ) {
        var i = 0
        setInterval(() => {
            i = (i + 1) % 118
            updateElm(i, true)
        }, 1000)
    } else {
        updateElm(atn)
    }

})();
