const fs = require('fs') // require so it runs as is without having to bable it
const path = require('path')

// we need the string of the template file - require gets you the function but not all the stuff above and below that babel adds
const templateFile = path.resolve(__dirname, '../components/web-components-template.js')
const templateString = fs.readFileSync(templateFile, 'utf8')

// file names shoulde be in kebob-case
// but react comonents should be in ReactCase - meaning the first letter, as well as the first letter after a -, with the - removed
function reactCase(str) {
  let arr = str.split('-')
  let Capitals = arr.map((item, index) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
  let ReactString = Capitals.join('')
  return ReactString
}

function reactDirectoryIndexer(dstPath, dirPaths) {
  if (dstPath[dstPath.length - 1] !== '/') dstPath += '/'
  console.info('dirPath', dirPaths)
  return new Promise(async (ok, ko) => {
    let handlers = {}
    try {
      if (typeof dirPaths === 'string') dirPaths = [dirPaths] // originally it was just a string, but now it should be an array
      for await (const dirPath of dirPaths) {
        var filenames = await new Promise((ok, ko) => {
          return fs.readdir(dirPath, (err, filenames) => (err ? ko(err) : ok(filenames)))
        })
        const filePath = dirPath[dirPath.length - 1] === '/' ? dirPath : dirPath + '/'
        console.info('filePath', filePath)
        filenames.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // sort from a to z
        for (const file of filenames) {
          try {
            if (file === 'index.js') continue // skip index files
            if (!/^[\w|\d|-]+(\.js$|\.jsx$|$)/.test(file)) {
              // ignore .map files, and files that don't end in .js and don't fit the pattern also accept directories
              continue
            } else {
              const name = file.replace(/(\.js$|\.jsx$)/, '')
              if (name !== name.toLowerCase()) throw new Error('indexHandlers found non lowercase name:', name)
              if (handlers[name])
                logger.warn('indexHandlers: handler', name, 'is being replaced from directory', dirPath)
              handlers[name] = filePath + name
            }
          } catch (error) {
            logger.error(`Error requiring api file ${file} on start`, error)
            return ko(error)
          }
        }
      }
      let outString = 'const Components={\n'
      for (const [handle, handler] of Object.entries(handlers)) {
        outString += `\t '${reactCase(handle)}':\trequire('./${path.posix.relative(dstPath, handler)}'),\n`
      }
      outString += '\n}\n'
      const finalString = templateString.replace(/const\sComponents[\s]*=[\s]*\{([\s\S^])*?}/, outString)
      await new Promise((ok, ko) => fs.writeFile(dstPath + 'index.js', finalString, err => (err ? ko(err) : ok())))
      ok()
    } catch (err) {
      console.error('api', err)
      ko(err)
    }
  })
}
let dirPaths = []
for (let i = 2; i < process.argv.length; i++) dirPaths.push(process.argv[i])
reactDirectoryIndexer(process.argv[2], dirPaths)
