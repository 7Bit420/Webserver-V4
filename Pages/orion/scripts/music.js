window.addEventListener('DOMContentLoaded', ()=>{
    document.body.requestFullscreen ??= document.body.webkitRequestFullscreen

    document.getElementById('FSY').addEventListener('click', ()=>{
        document.getElementById('Prompt').style.display = 'none'
        document.body.requestFullscreen()
    })
    document.getElementById('FSN').addEventListener('click', ()=>{
        document.getElementById('Prompt').style.display = 'none'
    })
})