/* checkboardWorklet.js */

class CheckerboardPainter {
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {*} geom 
     * @param {*} properties 
     */
    paint(ctx, geom, properties) {
        // Use `ctx` as if it was a normal canvas
        const colors = ['red', 'green', 'blue'];
        const size = 16;
        for (let y = 0; y < (geom.height / size); y++) {
            for (let x = 0; x < (geom.width / size); x++) {
                const color = colors[(x + y) % colors.length];
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.rect(x * size, y * size, size, size);
                ctx.fill();
            }
        }
    }
}

// Register our class under a specific name
registerPaint('checkerboard', CheckerboardPainter);