"use strict";

// when robots.txt is visited by a crawler, this is how to respond
export default function route() {
    this.app.get('/robots.txt', (req, res) => {
        res.type('text/plain')
        res.send('User-agent: *\nAllow: /')
    })
}