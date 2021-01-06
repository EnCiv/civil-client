'use strict';

// for this example, our landing page is redirected to join
export default function landingPage() {
    this.app.get('/', (req, res, next) => {
        try {
            res.redirect('/join')
        } catch (error) {
            this.emit('error', error)
        }
    })
}