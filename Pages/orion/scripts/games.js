var contentBlock = document.createElement('div')
var contentBlockInfo = document.createElement('p')

contentBlock.classList.add('block')
contentBlock.appendChild(contentBlockInfo);
contentBlockInfo.textContent = "Game Running";

(async () => {
    var gameCGF = (await (await fetch("games/manifiest.json")).json())

    gameCGF.games.forEach(game => {
        var elm = document.createElement('div')
        elm.classList.add('game')
        elm.style.background = `url("${game.icon}")`

        var infoContainer = document.createElement('div')
        var title = document.createElement('h1')
        var des = document.createElement('p')

        infoContainer.classList.add('info')
        title.classList.add('name')
        des.classList.add('description')

        title.innerText = game.name
        des.innerText = game.description

        infoContainer.appendChild(title)
        infoContainer.appendChild(des)

        elm.appendChild(infoContainer)

        elm.addEventListener('click', () => {
            window.location.replace(`/orion/games/${game.id}/index.html`)
        })

        document.getElementById('gameContainer').appendChild(elm)
    });
})()
