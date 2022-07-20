var ui = document.getElementById('finder');
var menu = document.createElement('div');

const searchPrams = new URLSearchParams(location.search)

function genDownloadButton(target) {
    var elm = document.createElement('div')
    elm.classList.add('download')
    elm.textContent = "Download"

    elm.addEventListener('click', (ev) => {
        var a = document.createElement('a')
        a.toggleAttribute('download')
        a.href = '/fs/' + target.getAttribute('path')
        a.click()
    }, { once: true })

    return elm
}

function genDeleteButton(target) {
    var elm = document.createElement('div')
    elm.classList.add('delete')
    elm.textContent = "Delete"

    elm.addEventListener('click', () => {
        var req = new XMLHttpRequest();
        req.open('DELETE', '/fs/' + target.getAttribute('path'))
        req.addEventListener('load', () => {
            target.remove()
        });
        req.send()
    })

    return elm
}

function genUploadButton(target) {
    var elm = document.createElement('div')
    elm.classList.add('upload')
    elm.textContent = "Upload"

    var prompt = document.createElement('div');
    var form = document.createElement('form');
    var text = document.createElement('h1');
    var submit = document.createElement('input');
    var file = document.createElement('input');

    prompt.classList.add('fsUPrompt')
    text.innerText = "Upload File"

    prompt.appendChild(text);
    prompt.appendChild(form);

    form.appendChild(file);
    form.appendChild(submit);

    form.action = "Javascript:;"
    submit.type = 'submit';
    file.type = 'file';

    prompt.style.position = 'fixed';
    prompt.style.display = 'block'

    prompt.addEventListener("click", (ev) => ev.stopPropagation());
    submit.addEventListener('click', async (ev) => {
        var req = new XMLHttpRequest();
        req.open('PUT', '/fs' + target.getAttribute('path') + file.files.item(0).name);
        req.send((await file.files.item(0).arrayBuffer()))
        prompt.remove()

        var nelm = document.createElement('div')
        var elmMenu = document.createElement('menu')

        target.appendChild(nelm)

        nelm.innerText = file.files.item(0).name

        nelm.classList.add('item')
        nelm.setAttribute('type', file.files.item(0).type)
        nelm.setAttribute('path', `${target.getAttribute('path')}${file.files.item(0).name}/`)
        nelm.setAttribute('name', file.files.item(0).name)

        elmMenu.classList.add('menu');
        elmMenu.appendChild(genDownloadButton(nelm));
        elmMenu.appendChild(genDeleteButton(nelm))
    })

    elm.addEventListener('click', (ev) => {
        prompt.style.left = `${ev.x}px`;
        prompt.style.top = `${ev.y}px`;
        document.body.appendChild(prompt);
        document.addEventListener('click', (ev) => {
            console.log(ev);
            prompt.remove();
        }, { once: true });
    });

    return elm
}

function genMkDirButton(target) {
    var elm = document.createElement('div')
    elm.classList.add('mkdir')
    elm.textContent = "Make Directory"

    elm.addEventListener('click', async (ev) => {
        var name = prompt('Name')
        var req = new XMLHttpRequest();
        req.open('PUT', '/fs' + target.getAttribute('path') + name);
        req.setRequestHeader('Content-Type', 'text/directory')
        req.send();

        var nelm = document.createElement('div')
        var elmMenu = document.createElement('menu')

        target.appendChild(nelm)

        nelm.innerText = name

        nelm.classList.add('item')
        nelm.setAttribute('type', 'text/directory')
        nelm.setAttribute('path', `${target.getAttribute('path')}${name}/`)
        nelm.setAttribute('name', name)

        elmMenu.classList.add('menu')
        elmMenu.appendChild(genDeleteButton(nelm))
        elmMenu.appendChild(genUploadButton(nelm))
        elmMenu.appendChild(genMkDirButton(nelm))
    });

    return elm
}

(async () => {
    async function loadElm(target = HTMLDivElement.prototype) {
        var req = new XMLHttpRequest();
        req.open('GET', '/fs/' + target.getAttribute('path'))
        req.addEventListener('load', () => {
            var res = req.responseText.trim().split('\n').filter(t => t.includes(':'));

            res.forEach(async (i) => {
                var p = i.split(':')
                var elm = document.createElement('div')
                var elmMenu = document.createElement('div')
                elm.classList.add('item')
                elm.setAttribute('type', decodeURIComponent(p[0]))
                elm.setAttribute('path', `${target.getAttribute('path')}${decodeURIComponent(p[1])}/`)
                elm.setAttribute('name', decodeURIComponent(p[1]))

                elm.addEventListener('mousedown', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation()

                    switch (ev.button) {
                        case 0:
                            // Left

                            break;
                        case 1:
                            // Middel

                            break;
                        case 2:
                            // Right
                            menu.remove()
                            menu = elmMenu

                            menu.style.top = `${ev.pageY}px`;
                            menu.style.left = `${ev.pageX}px`;

                            document.body.appendChild(menu);
                            menu.focus();
                            document.addEventListener('click', (ev) => {
                                menu.remove();
                            }, { once: true });
                            menu.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                menu.remove();
                            }, { once: true });
                            break;
                    }
                })

                switch (p[0]) {
                    case "text/directory":
                        elm.innerText = decodeURIComponent(p[1]);
                        elmMenu.classList.add('menu')
                        elmMenu.appendChild(genDeleteButton(elm))
                        elmMenu.appendChild(genUploadButton(elm))
                        elmMenu.appendChild(genMkDirButton(elm))
                        await loadElm(elm);
                        break;
                    default:
                        elmMenu.classList.add('menu');
                        elmMenu.appendChild(genDownloadButton(elm));
                        elmMenu.appendChild(genDeleteButton(elm))
                        elm.innerText = decodeURIComponent(p[1]);
                        break;
                }

                target.appendChild(elm)
            })
        })
        req.send()
    }

    ui.setAttribute('path', searchPrams.get('path') || '/')
    await loadElm(ui)

    var elmMenu = document.createElement('div')
    elmMenu.classList.add('menu')
    elmMenu.appendChild(genDeleteButton(ui))
    elmMenu.appendChild(genUploadButton(ui))
    elmMenu.appendChild(genMkDirButton(ui))

    console.log(elmMenu, ui)
    ui.addEventListener('mousedown', (ev) => {
        console.log('click')
        menu.remove()
        ev.preventDefault();
        ev.stopPropagation()

        switch (ev.button) {
            case 0:
                // Left

                break;
            case 1:
                // Middel

                break;
            case 2:
                // Right
                menu.remove()
                menu = elmMenu

                menu.style.top = `${ev.pageY}px`;
                menu.style.left = `${ev.pageX}px`;

                document.body.appendChild(menu);
                menu.focus();
                document.addEventListener('click', (ev) => {
                    menu.remove();
                }, { once: true });
                menu.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    menu.remove();
                }, { once: true });
                break;
        }
    })
})();

document.addEventListener('contextmenu', (ev) => ev.preventDefault())

