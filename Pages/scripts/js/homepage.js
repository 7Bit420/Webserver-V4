var running = true

var bars = []
var rowlen = 0
var targetLen = Math.floor(Math.random() * 5)

function initFunc() {
    document.getElementById('next-arrow').style.opacity = '100'
    document.getElementById('next-arrow').addEventListener('click', () => {
        window.scrollTo({
            behavior: 'smooth',
            left: window.innerWidth + 500
        })
        document.body.style.overflowY = 'scroll'
    }, { once: true })
}

document.addEventListener('DOMContentLoaded', async () => {

    var init = window.innerWidth + 100
    var rows = 13
    var maxLen = window.innerWidth * 2
    var rowDiv = document.getElementById('streaks')


    var crntBar = document.createElement('div')

    async function tick() {

        if (rowlen == targetLen) {
            rowlen = 0
            bars.push(crntBar)

            crntBar = document.createElement('div')

            rowDiv.appendChild(crntBar)
            crntBar.classList.add('bar')

            crntBar.style.top = `${Math.min(Math.max(Math.floor(Math.random() * rows - 1), 0), rows - 1) * 5}vh`

            targetLen = 50 + Math.floor(Math.random() * 100)
        } else {
            rowlen++
            crntBar.style.width = `${rowlen}px`
        }

        bars.forEach((t, i) => {
            if (t.offsetLeft >= maxLen) {
                t.remove()
            } else {
                t.style.left = `${t.offsetLeft + 1}px`
            }
        })

        if (init == 0) {
            initFunc()
            init--
        } else {
            init--
        }
        await new Promise(res => setTimeout(res))
    }

    window.scrollTo(0, 0)
    do {
        await tick()
    } while (running)
})

/* Text Based

var crntRow = 0
var rows = process.stdout.getWindowSize()[1] - 1
var maxLen = process.stdout.getWindowSize()[0] - 1
var selectedRow
var rowlen = 0
var rowArr = Array(rows).fill('')

setInterval(() => {
    if (rowlen == 0) {

        rowlen = 3 + Math.floor(Math.random() * 5)
        crntRow = crntRow++ > rows - 1 ? 0 : crntRow

        selectedRow = Math.min(Math.max(Math.floor(Math.random() * rows - 1), 0), rows - 1)
    } else {
        rowlen--
    }
    for (let i = 0; i < rows; i++) {
        rowArr[i] += i == selectedRow ? 'X' : ' '
        if (rowArr[i].length >= maxLen) { rowArr[i] = rowArr[i].slice(1, maxLen - 1) }
    }

    console.log(rowArr.join('\n'))
}, 100)

//*/