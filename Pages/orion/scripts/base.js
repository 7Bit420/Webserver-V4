var pageSelect = document.getElementById('page-select')

var pages = [
    { name: 'File System', path: '/orion/filesystem' },
    { name: 'Home', path: '/orion/home' },
    { name: 'Games', path: '/orion/games' },
    { name: 'Market', path: '/orion/market' },
]

const cookies = new Map();

for (var cookie of document.cookie.split(';')) {
    var cookie = cookie.split('=')
    cookies.set(cookie[0], cookie[1])
}

for (var page of pages) {
    var option = document.createElement('option')
    option.text = page.name
    option.value = page.path
    option.selected = page.path == location.pathname
    pageSelect.options.add(option)
}

if (page.path != '/orion/login') {
    var req = new XMLHttpRequest();
    var user = {}
    req.open("GET", "/user/me")
    req.addEventListener('load', () => {
        user = JSON.parse(req.responseText)
        if (!user.id) window.location.replace('login')
    })
    req.send()
}

pageSelect.addEventListener('change', (ev) => {
    location.replace(pages[pageSelect.selectedIndex].path)
})
