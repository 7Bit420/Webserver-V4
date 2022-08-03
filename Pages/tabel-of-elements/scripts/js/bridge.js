document.addEventListener('DOMContentLoaded', (ev) => {
    document.getElementById('tabel').addEventListener('message', console.log)
    window.addEventListener('message', console.log)
})