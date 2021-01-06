'use strict'

// for rendering a  mark down doc
// not tested recently 
export default function getMarkDown() {
    this.app.get('/doc/:mddoc', (req, res, next) => {
        fs.createReadStream(req.params.mddoc)
            .on('error', next)
            .on('data', function (data) {
                if (!this.data) {
                    this.data = ''
                }
                this.data += data.toString()
            })
            .on('end', function () {
                res.header({ 'Content-Type': 'text/markdown; charset=UTF-8' })
                res.send(this.data)
            })
    })
}