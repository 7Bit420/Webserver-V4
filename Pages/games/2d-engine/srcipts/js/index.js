import * as assetLoader from './src/assetLoader.js'

(async () => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')

    document.addEventListener('DOMContentLoaded', () =>
        document.getElementById('canvas').replaceWith(canvas));
    ;
    var width = innerWidth
    var height = innerHeight
    canvas.width = width
    canvas.height = height

    ctx.fillRect((width / 2) - 25, (height / 2) - 25, 50, 50)
})()
