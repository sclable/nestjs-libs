const path = require('path')

const writeFile = require('fs-extra').writeFile
const glob = require('glob-promise').promise
const compileFromFile = require('json-schema-to-typescript').compileFromFile

async function run() {
  const files = await glob('**/*schema.json', { ignore: 'node_modules/**/*' })
  files.forEach(async file => {
    const dts = await compileFromFile(file)
    await writeFile(
      path.resolve(path.dirname(file), `${path.basename(file, 'json')}d.ts`),
      dts,
    )
  })
}

run()
