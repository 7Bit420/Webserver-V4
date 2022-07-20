var req = new XMLHttpRequest()
let actions = []
req.open("GET", "./actions.json")
req.addEventListener('load', loadActions)
req.send()

async function loadActions() {
    actions = JSON.parse(req.responseText)
    document.getElementById('actions').replaceChildren()

    actions.forEach(async action => {

        var container = document.createElement('div')
        var title = document.createElement('h1')
        var description = document.createElement('p')

        var icon = document.createElement('img')


        container.classList.add("action")
        icon.classList.add("icon")


        icon.src = action.icon
        container.appendChild(icon)

        container.appendChild(title)
        container.appendChild(description)

        title.append(action.name)
        description.append(action.description)

        document.getElementById('actions').appendChild(container)

        if (self == top) {
            container.addEventListener('click', () => {
                switch (action.type) {
                    case "script":
                        var script = document.createElement('script')
                        script.src = action.url
                        document.head.appendChild(script)
                        break;
                    case "redirect":
                        window.location.replace(action.url)
                        break;
                }
            })
        } else {
            container.addEventListener('click', () => {
                window.parent.postMessage({
                    body: action,
                    action: "runAction"
                }, "*")
            })
        }
    });
}

/**
 * 
 * @param {string} name 
 * @param {string} description 
 * @param {'basic'|'live'} type 
 * @param  {...any} args 
 */

function eventConstructor(name, description, type, ...args) {

    switch (type) {
        case "basic":
            var container = document.createElement('div')
            var title = document.createElement('h1')
            var des = document.createElement('p')

            title.innerText = name
            des.innerText = description

            container.classList.add('event', 'basic')
            title.classList.add('event', 'title')
            des.classList.add('event', 'description')

            container.appendChild(title)
            container.appendChild(des)

            return {
                get elm() { return container },
                get title() { return title.innerHTML },
                get description() { return des.innerHTML },
                set title(i) { return title.innerHTML = i },
                set description(i) { return des.innerHTML = i },
            }
        case "live":
            var container = document.createElement('div')
            var frame = document.createElement('iframe')
            var title = document.createElement('h1')
            var des = document.createElement('p')

            title.innerText = name
            des.innerText = description

            container.classList.add('event', 'live')
            frame.classList.add('event', 'container')
            title.classList.add('event', 'title')
            des.classList.add('event', 'description')

            container.appendChild(frame)
            container.appendChild(title)
            container.appendChild(des)

            return {
                get elm() { return container },

                get frame() { return frame },
                set frame(i) { return frame.replaceWith(frame = i) },

                get title() { return title.innerHTML },
                set title(i) { return title.innerHTML = i },

                get description() { return des.innerHTML },
                set description(i) { return des.innerHTML = i },
            }
        default:
            throw new TypeError('Event Type Not Reconised')
    }
}

async function fetchTimetabel() {
    return
    const dateRegex = /[^:\d]/g
    const timeRegex = /(\w+)[\D\/](\w+)[\D\/](\w+)/
    var req = new XMLHttpRequest();
    req.open('GET', 'data/timetabel.csv')

    return new Promise((res, reg) => {
        req.send()
        req.addEventListener('load', () => {
            var csv = req.responseText.split('\n').map(t => t.trim()).filter(t => t.length > 0).map(t => t.split(','));
            var headers = csv.splice(0, 1)[0];

            var out = csv.map(t => {
                var obj = {};
                t.forEach((v, i) => { obj[headers[i]] = v });
                return obj;
            })
            
            var crntDay = ''
            var Events = []
            out.forEach((v,t)=>{
                if (v['All day event'] == 'TRUE') return crntDay = v.Subject;
                var obj = {
                    start: (`${v['Start Date'].replace(
                        /(\w+)[\D\/](\w+)[\D\/](\w+)/,'$3-$2-$1')}T${v['Start Time'].replace(/[^:\d]+/,'')}`),
                    subject: v.Subject,
                    day: crntDay,
                    original: v
                }
                
                Events.push(obj)
            })

            console.log(Events)
        })
    })
}

async function loadEvents() {
    var endPontHandlers = [
        fetchTimetabel
    ];

    (await Promise.all(endPontHandlers.map(t => t())))
}

loadEvents()
