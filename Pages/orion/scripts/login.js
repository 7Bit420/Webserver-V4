
var form = document.getElementById('form')

form.addEventListener('submit', () => {
    var data = new FormData(form);
    var req = new XMLHttpRequest();

    req.open("POST", "/user/login")
    req.setRequestHeader("Content-Type", "application/json")

    req.addEventListener('load', (ev) => {
        if (localStorage.getItem("dev") === "true") return;
        if (req.status == 404) {
            form.style.border = "solid red 1px"
            setTimeout(() => form.style.border = "none", 1000)
            return;
        };
        window.location.replace("home")
    })

    req.send(JSON.stringify({
        username: data.get('username'),
        password: data.get('password')
    }))

})
