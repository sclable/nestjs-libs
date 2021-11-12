const resolve = require('path').resolve

const copy = require('fs-extra').copy
const glob = require('glob-promise').promise

async function run() {
  const schemaFiles = await glob('**/*schema.*', {
    ignore: ['node_modules/**/*', 'dist/**/*'],
  })
  const templates = await glob('**/templates', {
    ignore: ['node_modules/**/*', 'dist/**/*'],
  })
  try {
    await Promise.all(schemaFiles.map(async file => copy(file, resolve('dist', file))))
    await Promise.all(templates.map(async tmpl => copy(tmpl, resolve('dist', tmpl))))
    await copy('src/collection.json', 'dist/src/collection.json')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

run()
