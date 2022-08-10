const width = 7
const height = 14;

const tetrominoes = [
    {
        name: 'idk',
        data: [
            [1, 1, 1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [1],
            [1, 1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [1],
            [1, 1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [0, 1],
            [1, 1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [0, 1, 1],
            [1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [1, 1],
            [0, 1, 1],
        ]
    },
    {
        name: 'idk',
        data: [
            [1, 1],
            [1, 1],
        ]
    },
];

var gameElmGrid = new Array(height).fill(undefined).map(() => new Array(width));
var gameGrid = new Array(height).fill(undefined).map(() => new Array(width));
var index = Math.floor(Math.random() * tetrominoes.length);
var gameRows = []
var crntPiece = tetrominoes[index];

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
            if (srcData[dy + y][dx + x] == data[dy][dx]) {
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

    function clearGrid() {
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

    function tick() {
        clearGrid()
        drawPiece(crntPiece.data, 1, 1)
    }

    tick()
})()
