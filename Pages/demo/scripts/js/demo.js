
var titleText = "Learn To code"
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

document.addEventListener('DOMContentLoaded', async () => {
    var title = document.getElementById('title')
    var b = false

    for (let i = 0; i <= titleText.length; i++) {
        for (let a = 0; a < 1; a++) {
            title.innerText = titleText.slice(0, i).padEnd(titleText.length,
                "".padEnd(titleText.length, "x").replace(/x/g, () => chars[Math.floor(Math.random() * chars.length)]))

            await new Promise(res => setTimeout(res, 10))
        }
    }

    var z = setInterval(() => {
        title.innerText = b ? titleText : titleText + '_'
        b = !b
    }, 500)

    var t
    document.addEventListener('keydown', t = async (key) => {
        if (key.key != 'Enter') return;
        clearInterval(z)
        document.removeEventListener('keydown', t)
        for (let i = 0; i <= titleText.length; i++) {
            for (let a = 0; a < 5; a++) {
                title.innerText = titleText.slice(0, titleText.length - i) + chars[Math.floor(Math.random() * chars.length)]

                await new Promise(res => setTimeout(res, 10))
            }
        }
        title.innerText = ''
        var grid = Array(Math.floor(Math.random() * 30)).fill([])
        for (let i = 0; i <= titleText.length; i++) {
            var len = (Math.floor(Math.random() * 10) + 5)
            grid[i] = ""
            for (let a = 0; a < len; a++) {
                grid[i] += chars[Math.floor(Math.random() * chars.length)] + '\n'
            }
        }

        var unit = window.innerWidth / 30
        for (let i = 0; i < grid.length; i++) {
            var p = document.createElement('p')
            p.innerText = grid[i]
            p.style.width = `${unit}px`
            p.style.left = `${unit * i}px`
            p.classList.add('text', 'matrix')
            document.body.appendChild(p)
        }
    })
})
