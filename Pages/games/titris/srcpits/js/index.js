const width = 7
const height = 14;

const tetrominoes = [
    {
        name: 'idk',
        data: [
            [1, 1, 1, 1],
        ],
        width: 4,
        height: 1
    },
    {
        name: 'idk',
        data: [
            [1],
            [1, 1, 1],
        ],
        width: 3,
        height: 2
    },
    {
        name: 'idk',
        data: [
            [1],
            [1, 1, 1],
        ],
        width: 3,
        height: 2
    },
    {
        name: 'idk',
        data: [
            [0, 1],
            [1, 1, 1],
        ],
        width: 3,
        height: 2
    },
    {
        name: 'idk',
        data: [
            [0, 1, 1],
            [1, 1],
        ],
        width: 3,
        height: 2
    },
    {
        name: 'idk',
        data: [
            [1, 1],
            [0, 1, 1],
        ],
        width: 3,
        height: 2
    },
    {
        name: 'idk',
        data: [
            [1, 1],
            [1, 1],
        ],
        width: 2,
        height: 2
    },
];

var gameElmGrid = new Array(height).fill(undefined).map(() => new Array(width));
var gameGrid = new Array(height).fill(undefined).map(() => new Array(width));
var gameRows = []
var crntPiece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
var crntPieceInfo = {
    maxHeight: height - crntPiece.height,
    maxLeft: 0,
    maxRight: width - crntPiece.width
}

function dataToColour(numb) {
    switch (numb) {
        case 1:
            return 'black'
        case 0:
            return 'transperent'
        default:
            return 'transperent'
    }
}

function calcBounds(data) {
    return { width: Math.max(...data.map(t => t.length)), height: data.length }
}

function grabSnipet(data, x, y, dx, dy) {
    var outData = new Array(dy).fill(undefined).map(() => new Array(dx))
    for (let zy = 0; zy < dy; zy++) {
        for (let zx = 0; zx < dx; zx++) {
            outData[zy][zx] = data[y + zy][x + zx]
        }
    }
    return outData
};

function drawPiece(data, x, y) {
    for (let dy = 0; dy < data.length; dy++) {
        for (let dx = 0; dx < data[dy].length; dx++) {
            gameGrid[dy + y][dx + x] = data[dy][dx]
            gameElmGrid[dy + y][dx + x].style.background = dataToColour(data[dy][dx])
        }
    }
}

function deletePiece(data, x, y) {
    for (let dy = 0; dy < data.length; dy++) {
        for (let dx = 0; dx < data[dy].length; dx++) {
            gameGrid[dy + y][dx + x] = 0
            gameElmGrid[dy + y][dx + x].style.background = ''
        }
    }
}

/**
 * @param {Array<Array<number | HTMLDataElement>} srcData 
 * @param {number} data 
 * @param {number} dx 
 * @param {number} dy 
 * @param {number} direaction 
 */
function calcIntersect(srcData, data, x, y) {
    var intersectPoints = []

    for (let dy = 0; dy < data.length; dy++) {
        for (let dx = 0; dx < data[dy].length; dx++) {
            if (srcData[dy + y][dx + x] == data[dy][dx] && srcData[dy + y][dx + x] != 0) {
                intersectPoints.push({ x: dx + x, y: dy + x })
            }
        }
    }

    return intersectPoints
};

; (async () => {

    var game = document.createElement('div')
    document.addEventListener('DOMContentLoaded', () =>
        document.getElementById('game').replaceWith(game));
    ;

    function initGrid() {
        for (let y = 0; y < height; y++) {
            var gridRow = document.createElement('tr')
            gameRows[y] = gridRow
            for (let x = 0; x < width; x++) {
                gameElmGrid[y][x] = document.createElement('td')
                gameGrid[y][x] = 0
                gridRow.appendChild(gameElmGrid[y][x])
            }
            game.appendChild(gridRow)
        }
    }

    function clearGrid() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                gameElmGrid[y][x].style.background = ''
            }
        }
    }

    function minMax(min, v, max) {
        return Math.min(Math.max(min, v), max)
    }

    function updateCrntPiece() {
        crntPiece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)]
        crntPieceInfo = {
            maxHeight: height - crntPiece.height,
            maxLeft: 0,
            maxRight: width - crntPiece.width,
            x: 0,
            y: 0
        }
    }

    function movePiece(x, y) {
        crntPieceInfo.y++
        y = Math.min(crntPieceInfo.maxHeight, crntPieceInfo.y)
        drawPiece(crntPiece.data, x, y)
    }

    initGrid()
    updateCrntPiece()
    function tick() {
        var y = Math.min(crntPieceInfo.maxHeight, crntPieceInfo.y)
        var x = minMax(crntPieceInfo.maxLeft, crntPieceInfo.x, crntPieceInfo.maxRight)
        deletePiece(crntPiece.data, x, y)
        deletePiece(crntPiece.data, x, y)
        var intersectData = calcIntersect(gameGrid, crntPiece.data, x, Math.min(y + 1, crntPieceInfo.maxHeight))
        if (intersectData.length > 0) {
            console.log(intersectData, gameGrid)
            drawPiece(crntPiece.data, x, y)
            updateCrntPiece()
        } else {
            movePiece(x, y)
        }
        if (y == crntPieceInfo.maxHeight) {
            updateCrntPiece()
        }
    }

    // setInterval(tick, 500)
    globalThis.tick = tick
})()
