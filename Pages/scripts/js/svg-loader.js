
document.addEventListener('DOMContentLoaded', () => {
    for (var svg of document.getElementsByTagName('svg')) {
        var req = new XMLHttpRequest();
        req.open('GET', svg.getAttribute('src'));
        req.send();
        req.addEventListener('load', () => {
            svg.replaceWith(req.responseXML.firstChild);
        });
    };
});
