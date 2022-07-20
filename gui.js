
class gui {

    x = 0;
    y = 0;
    out = [['']];

    /**
     * 
     * @param {NodeJS.Process} process 
     */
    constructor(process) {

        process.stdin.setRawMode(true)

        this.x = process.stdout.getWindowSize()[0];
        this.y = process.stdout.getWindowSize()[1];
        
        this.out = (new Array(this.y)).fill((new Array(this.x)).fill(' '));
        
        this.out[0][0] = 'x'
        this.out[0][1] = 'y'

        console.log(this.out.map(t=>t.join('')).join('\n'))
        // console.log(this.out)

        
    }
}

new gui(process)

