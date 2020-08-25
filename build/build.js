const {resolve} = require('path')
const minify = require('minify')
const {writeFile} = require('fs')
const walk = require('walk')
const constants = {
  file: 'file',
  end: 'end'
}

const minifyFiles = (files) => {
  files.map((filePath) => {
    minify(filePath)
      .then((res) => {
        writeFile(filePath, res, () => {
          console.log(filePath, 'is success')
        })
      })
      .catch((e) => console.error(e))
  })
}

const builder = (dir) => {
  const rootDir = resolve(__dirname, '..', dir)
  const files = []
  const walker = walk.walk(rootDir, {followLinks: false})
  walker.on(constants.file, (root, stat, next) => {
    files.push(`${root}/${stat.name}`)
    next()
  })
  walker.on(constants.end, () => minifyFiles(files))
}

builder('dist')
