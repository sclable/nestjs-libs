#!/usr/bin/env node

const glob = require('glob')
const shelljs = require('shelljs')

const packages = glob.sync('dist/*/')

packages.forEach(match => {
  const src = match + '*'
  const pkg = 'packages' + match.substring(4)
  const dst = pkg + 'dist/'
  shelljs.mkdir('-p', dst)
  if (process.platform === 'linux') {
    shelljs.exec(`cp -Rvu ${src} ${dst}`)
  } else {
    shelljs.cp('-Ru', src, dst)
  }
})
