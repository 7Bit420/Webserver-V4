var input = "M 166.4 70.6 Q 166.4 75.2 163 78.4 L 113.2 128.2 Q 110 131.4 105.8 131.4 Q 101.4 131.4 98.4 128.6 Q 95.6 125.8 95.6 121.4 Q 95.6 119.2 96.4 117.4 Q 97.4 115.4 98.8 114 L 113.6 99 L 142.2 73 L 146 79.4 L 117 81.2 L 30.2 81.2 Q 25.4 81.2 22.4 78.2 Q 19.6 75.2 19.6 70.6 Q 19.6 66 22.4 63.2 Q 25.4 60.2 30.2 60.2 L 117 60.2 L 146 62 L 142.2 68.2 L 113.6 42.4 L 98.8 27.2 Q 97.4 26 96.4 24 Q 95.6 22.2 95.6 20 Q 95.6 15.6 98.4 12.8 Q 101.4 10 105.8 10 Q 110 10 113.2 13.2 L 163 63 Q 166.4 66.2 166.4 70.6 Z"

var allChunks = []
var crntChunk = ''
var processing = input.split(' ')

processing.forEach((n, i) => {
    if (!Number.isFinite(Number(processing[i + 1]))) {
        allChunks.push(crntChunk + n)
        crntChunk = ''
    } else {
        crntChunk += (n + ' ')
    }
})

var x = 0
var y = 0

allChunks.forEach(t => {
    var prams = t.split(' ')

    switch (prams[0]) {
        case 'M':
            x = Number(prams[1])
            y = Number(prams[2])
            break;
        case 'L':
            x += Number(prams[1])
            y += Number(prams[2])
            break;
        case 'Q':
            x += Number(prams[1])
            y += Number(prams[2])
            break;
        default:
            break;
    }
})

console.log(x,y)