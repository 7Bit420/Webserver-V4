module.exports = {
    to (n, base, bigEdian = true) {
        var p = []
        while (0 < n) {
            var x = n % base
            var n = (n - x) / base
            p[bigEdian ? 'unshift' : 'push'](x)
        }
        return p
    },
    from (n, base, bigEdian = true) {
        var o = 0
        if (bigEdian) n.reverse();
        for (let i = 0; i < n.length; i++) {
            o += n[i] * (base ** i)
        }
        return o
    }
}