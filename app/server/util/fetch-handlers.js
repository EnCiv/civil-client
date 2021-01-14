import fs from 'fs'

export default function fetchHandlers(dirPaths, handlers, type = 'function') {
    console.info("dirPath", dirPaths)
    return new Promise(async (ok, ko) => {
        try {
            if (typeof dirPaths === 'string') dirPaths = [dirPaths] // originally it was just a string, but now it should be an array
            for await (const dirPath of dirPaths) {
                var filenames = await new Promise((ok, ko) => {
                    return fs.readdir(dirPath, (err, filenames) => (err ? ko(err) : ok(filenames)))
                })
                const filePath = dirPath[dirPath.length - 1] === '/' ? dirPath : dirPath + '/'
                console.info("filePath", filePath)
                filenames.sort((a, b) => a < b ? -1 : a > b ? 1 : 0) // sort from a to z
                for (const file of filenames) {
                    try {
                        if (file === 'index.js') continue // skip index files
                        if (!/[\w|\d|-]+.js$/.test(file)) {
                            // ignore .map files, and files that don't end in .js and don't fit the pattern
                            continue
                        } else {
                            const name = file.replace(/\.js$/, '')
                            if (name !== name.toLowerCase())
                                throw new Error("fetchHandlers found non lowercase name:", name)
                            const handler = require(filePath + file).default
                            if (typeof handler !== type) {
                                throw new Error(`fetchHandlers ${name} (${file}) is not a ${type}`)
                            }
                            if (handlers[name]) logger.warn("fetchHandlers: handler", name, "is being replaced from directory", dirPath)
                            handlers[name] = handler
                        }
                    } catch (error) {
                        logger.error(`Error requiring api file ${file} on start`, error)
                        return ko(error)
                    }
                }
            }
            ok()
        } catch (err) {
            console.error('api', err)
            ko(err)
        }
    })
}