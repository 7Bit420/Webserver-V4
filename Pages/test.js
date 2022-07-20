/*
document.getElementById('test').addEventListener('change', () => {
    window.addEventListener('beforeunload', (event) => {
        event.returnValue = `L + Ratio`;
    });
}, { once: true });

document.getElementById('test').style.position = 'absolute'
window.onscroll = () => document.getElementById('test').style.top = `${window.pageYOffset + 10}px`
// */

setInterval(() => {
    document.getElementById('Motor-FL').value = (
        Number(document.getElementById('Axis-A').value) -
        Number(document.getElementById('Axis-B').value) +
        Number(document.getElementById('Axis-C').value)
    );
    document.getElementById('Motor-FR').value = (
        Number(document.getElementById('Axis-A').value) -
        Number(document.getElementById('Axis-B').value) -
        Number(document.getElementById('Axis-C').value)
    );
    document.getElementById('Motor-BL').value = (
        Number(document.getElementById('Axis-A').value) +
        Number(document.getElementById('Axis-B').value) -
        Number(document.getElementById('Axis-C').value)
    );
    document.getElementById('Motor-BR').value = (
        Number(document.getElementById('Axis-A').value) +
        Number(document.getElementById('Axis-B').value) +
        Number(document.getElementById('Axis-C').value)
    );
}, 100)

var rStream, wStream, mStream;

document.getElementById('screen').addEventListener('click', () => {
    var vid = document.getElementById('vid')
    navigator.mediaDevices[confirm("Stream Display") ? "getDisplayMedia" : "getUserMedia"]({
        audio: true,
        video: true
    }).then(mStream => {
        vid.srcObject = mStream;
        vid.play()
        rStream = new MediaRecorder(mStream);

        var starttime = Date.now()
        rStream.start(100)
        var livestream = new WebSocket('wss://localhost/livestream/stream')
        rStream.addEventListener('dataavailable', (ev)=>{
            livestream.send(ev.data)
        })

    }).catch(console.log)
})


var canvas = document.getElementById('circle')
var ctx = canvas.getContext('2d')

var radios = 450;
var px = 10;
var increment = 1;

setInterval(() => {
    increment = document.getElementById('resalution').value / 100
    px = document.getElementById('thickness').value
    radios = document.getElementById('radious').value
    update()
}, 2000)

update()

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (var angle = 0; angle <= 360; angle += increment) {
        ctx.fillRect(
            Math.round(Math.cos(angle) * radios) + (canvas.height / 2),
            Math.round(Math.sin(angle) * radios) + (canvas.width / 2),
            px,
            px
        )
    }
}



