import fs from 'fs'

export default function fetchHandlers(dirPath, handlers) {
    console.info("dirPath", dirPath)
    return new Promise(async (ok, ko) => {
        try {
            var filenames = await new Promise((ok, ko) => {
                return fs.readdir(dirPath, (err, filenames) => (err ? ko(err) : ok(filenames)))
            })
            const filePath = dirPath[dirPath.length - 1] === '/' ? dirPath : dirPath + '/'
            console.info("filePath", filePath)
            filenames.sort((a, b) => a < b ? -1 : a > b ? 1 : 0) // sort from a to z
            filenames.forEach(file => {
                try {
                    if (file === 'index.js') return // skip index files
                    if (!/[\w|\d|-]+.js$/.test(file)) {
                        // ignore .map files, and files that don't end in .js and don't fit the pattern
                        return
                    } else {
                        const name = file.replace(/\.js$/, '')
                        if (name !== name.toLowerCase())
                            throw new Error("fetchHandlers found non lowercase name:", name)
                        const handler = require(filePath + file).default
                        if (typeof handler !== 'function') {
                            throw new Error(`fetchHandlers ${name} (${file}) is not a function`)
                        }
                        handlers[name] = handler
                    }
                } catch (error) {
                    logger.error(`Error requiring api file ${file} on start`, error)
                    return ko(error)
                }
            })
            ok()
        } catch (err) {
            console.error('api', err)
            ko(err)
        }
    })
}