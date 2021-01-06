'use strict';


function isHostOnLan(hostname) {
    // so we can access the server from the LAN while in development - but not in production like http://192.168.1.6:3011
    if (process.env.NODE_ENV !== 'development') return false
    let parts = hostname.split('.')
    if (parts.length !== 4) return false
    if (parts[0] === '192' && parts[1] === '168') return true
    return false
}

export default function httpToHttps() {
    this.app.use((req, res, next) => {
        let hostName = req.hostname
        if (hostName === 'localhost') return next()
        if (isHostOnLan(hostName)) return next() //so we can access from the LAN
        if (!req.secure || req.protocol !== 'https') {
            console.info('server.httpToHttps redirecting to ', req.secure, 'https://' + req.hostname + req.url)
            res.redirect('https://' + req.hostname + req.url)
        } else next() /* Continue to other routes if we're not redirecting */
    })
}
