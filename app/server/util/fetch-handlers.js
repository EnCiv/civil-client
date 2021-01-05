import S from 'underscore.string'
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
            filenames.forEach(file => {
                try {
                    if (file === 'index.js') return // skip index files
                    if (!/[\w|\d|-]+.js$/.test(file)) {
                        // ignore .map files, and files that don't end in .js and don't fit the pattern
                        return
                    } else {
                        const name = S(file.replace(/\.js$/, ''))
                            .humanize()
                            .value()
                            .toLowerCase()
                        const handler = require(filePath + file).default
                        if (typeof handler !== 'function') {
                            throw new Error(`API handler ${name} (${file}) is not a function`)
                        }
                        handlers[name] = handler
                        handlers[name].slugName = file.replace(/\.js$/, '')
                    }
                } catch (error) {
                    logger.error(`Error requiring api file ${file} on start, skipping`, error)
                    return // keep processing more files
                }
            })
            ok()
        } catch (err) {
            console.error('api', err)
            ko(err)
        }
    })
}