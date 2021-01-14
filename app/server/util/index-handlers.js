
const fs = require('fs') // require so it runs as is without having to bable it
const path = require('path')

// file names shoulde be in kebob-case
// but react comonents shoule be in ReactCase - meaning the first letter, as well as the first letter after a -, with the - removed
function reactCase(str) {
    let arr = str.split('-');
    let Capitals = arr.map((item, index) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
    let ReactString = Capitals.join('');
    return ReactString
}

function indexHandlers(dstPath, dirPaths) {
    if (dstPath[dstPath.length - 1] !== '/') dstPath += '/'
    console.info("dirPath", dirPaths)
    return new Promise(async (ok, ko) => {
        let handlers = {}
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
                                throw new Error("indexHandlers found non lowercase name:", name)
                            if (handlers[name]) logger.warn("indexHandlers: handler", name, "is being replaced from directory", dirPath)
                            handlers[name] = filePath + name
                        }
                    } catch (error) {
                        logger.error(`Error requiring api file ${file} on start`, error)
                        return ko(error)
                    }
                }
            }
            let indexString = await new Promise((ok, ko) => fs.readFile(dstPath + 'index.js', 'utf8', (err, string) => err ? ok('') : ok(string)))
            let outString = "const Components={\n"
            for (const [handle, handler] of Object.entries(handlers)) {
                outString += `\t '${reactCase(handle)}':\trequire('./${path.relative(dstPath, handler)}'),`
            }
            outString += "\n}\n"
            let writeString
            if (indexString)
                writeString = indexString.replace(/const\sComponents\s*=\s*{[\s|\S]*}/, outString)
            else
                writeString = "'use strict';\n" + outString + "module.exports.Components=Components\n\n"
            await new Promise((ok, ko) => fs.writeFile(dstPath + 'index.js', writeString, err => err ? ko(err) : ok()))
            ok()
        } catch (err) {
            console.error('api', err)
            ko(err)
        }
    })
}
let dirPaths = []
for (let i = 2; i < process.argv.length; i++)
    dirPaths.push(process.argv[i])
indexHandlers(process.argv[2], dirPaths)