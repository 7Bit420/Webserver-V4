(async () => {
    await new Promise(res => document.addEventListener('DOMContentLoaded', res))

    var permissionBtn = document.getElementById('permission')
    var hasPermission = "default"

    permissionBtn.addEventListener('click', () => {
        Notification.requestPermission().then((value) => {
            hasPermission = value
        }, (fail) => {
            console.warn(fail)
        })
    })

    var actions = []

    var badge = document.getElementById('badge')
    var icon = document.getElementById('icon')
    var image = document.getElementById('image')

    var submit = document.getElementById('submit')

    var notifIconURL
    var notifImageURL
    var notifBadgeURL

    submit.addEventListener('click', () => {
        var form = new FormData(document.getElementById('form'))

        console.log(Array.from(form.entries()))

        URL.revokeObjectURL(notifIconURL)
        URL.revokeObjectURL(notifImageURL)
        URL.revokeObjectURL(notifBadgeURL)

        notifIconURL = URL.createObjectURL(form.get('icon'))
        notifImageURL = URL.createObjectURL(form.get('image'))
        notifBadgeURL = URL.createObjectURL(form.get('badge'))

        var notification = new Notification(form.get('title'), {
            // actions: ,
            body: form.get('body'),
            data: form.get('body'),
            dir: form.get('dir'),
            badge: notifBadgeURL,
            icon: notifIconURL,
            image: notifImageURL,
            lang: form.get('lang'),
            renotify: form.get('renotify'),
            requireInteraction: form.get('requireInteraction'),
            silent: form.get('silent'),
            tag: form.get('tag'),
            timestamp: Date.parse(form.get('timestamp')),
            vibrate: [200, 50, 200],
        })

        notification.addEventListener('show',()=>{
            console.info('Notification Shown')
        })

        notification.show()
        console.log(notification)
    })
})()