'use strict';

// used by sendgrid's loader.io for load testing.  This is just so sendgrid can verify that you have permission to test this server
//
// Loader.io on Heroku requires the server to respond to their token request in order to validate
export default function route() {
    if (process.env.LOADERIO_TOKEN)
        this.app.get('/' + process.env.LOADERIO_TOKEN + '/', (req, res) => {
            res.type('text/plain')
            res.send(process.env.LOADERIO_TOKEN)
        })
}