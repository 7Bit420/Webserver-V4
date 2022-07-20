


const colours = [
    "#3867c7",
    "#3269c9",
    "#2c6acb",
    "#246ccd",
    "#196dce",
    "#086fd0",
    "#0070d2",
    "#0072d4",
    "#0074d5",
    "#0075d7",
    "#0077d9",
    "#0078da",
    "#007adc",
    "#007bdd",
    "#007ddf",
    "#007ee0",
    "#0080e1",
    "#0081e3",
    "#0083e4",
    "#0085e5",
    "#0086e6",
    "#0088e7",
    "#0089e8",
    "#008ae9",
    "#008cea",
    "#008deb",
    "#008fec",
    "#0090ed",
    "#0092ee",
    "#0093ef",
    "#0095ef",
    "#0096f0",
    "#0098f1",
    "#0099f1",
    "#009af2",
    "#009cf2",
    "#009df3",
    "#009ff3",
    "#00a0f3",
    "#00a1f4",
    "#00a3f4",
    "#00a4f4",
    "#00a5f4",
    "#00a7f4",
    "#00a8f4",
    "#00aaf4",
    "#00abf4",
    "#00acf4",
    "#00aef3",
    "#00aff3",
    "#00b0f3",
    "#00b1f3",
    "#00b3f2",
    "#00b4f2",
    "#00b5f1",
    "#00b7f1",
    "#00b8f0",
    "#00b9ef",
    "#00baef",
    "#00bcee",
    "#00bded",
    "#00beec",
    "#00bfeb",
    "#00c0eb",
    "#00c2ea",
    "#00c3e9",
    "#00c4e7",
    "#00c5e6",
    "#00c6e5",
    "#00c8e4",
    "#00c9e3",
    "#00cae2",
    "#00cbe0",
    "#00ccdf",
    "#00cddd",
    "#00cfdc",
    "#00d0db",
    "#00d1d9",
    "#00d2d8",
    "#00d3d6",
    "#00d4d4",
    "#00d5d3",
    "#00d6d1",
    "#00d7cf",
    "#00d8ce",
    "#00dacc",
    "#00dbca",
    "#00dcc8",
    "#00ddc6",
    "#00dec5",
    "#00dfc3",
    "#00e0c1",
    "#00e1bf",
    "#00e2bd",
    "#00e3bb",
    "#00e4b9",
    "#00e5b7",
    "#00e6b5",
    "#00e7b3",
    "#00e8b1",
    "#00e9ae",
    "#00eaac",
    "#00ebaa",
    "#00eba8",
    "#00eca6",
    "#00eda4",
    "#00eea1",
    "#00ef9f",
    "#00f09d",
    "#00f19b",
    "#00f299",
    "#00f296",
    "#00f394",
    "#00f492",
    "#00f590",
    "#00f68d",
    "#00f78b",
    "#00f789",
    "#19f887",
    "#2bf984",
    "#38fa82",
    "#42fa80",
    "#4bfb7e",
    "#54fc7b",
    "#5bfc79",
    "#62fd77",
    "#69fe74",
    "#6ffe72",
    "#75ff70"
]

var svgs = 7
var points = 20
var crntSvgs = []

document.addEventListener('keydown', (ev) => {
    switch (ev.code) {
        case 'Space':
            crntSvgs.forEach(t=>t.remove());
            crntSvgs = []
            for (let i = 0; svgs > i; i++) {
                Promise.resolve().then(() => {
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg")
                    var path = document.createElementNS('http://www.w3.org/2000/svg', "path")

                    svg.setAttribute("height", 250)
                    svg.setAttribute("width", window.innerWidth)

                    svg.setAttribute('fill', colours[Math.round(colours.length / svgs * i)])
                    svg.setAttribute('note', Math.round(colours.length / svgs * i))

                    svg.style.top = `${100 * i}px`

                    var int = window.innerWidth / points
                    var pathName = "M 0 250 "

                    for (let i = 0; i <= points; i++) {
                        pathName += `L ${Math.round(i * int)} ${Math.floor(Math.random() * 75) + 50} `
                    }

                    pathName += `L ${window.innerWidth} 250 Z`

                    path.setAttribute('d', pathName)

                    svg.appendChild(path)
                    crntSvgs.push(svg)

                    document.body.appendChild(svg)
                })
            }
            break;
    }
})

// setTimeout(() => location.reload(), 700)