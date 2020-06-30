#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help'
  }
})
const { watch } = require('../lib')
const pkg = require('../package.json')
const man = require('../lib/man')

const targetName = argv._[0]

if (argv.version) {
  console.log(`${pkg.version}`)
  process.exit(0)
}

if (argv.help) {
  console.log(man)
  process.exit(0)
}

try {
  watch({
    cwd: process.cwd(),
    target: targetName
  })
} catch (err) {
  // suppress errors in cli mode
  if (process.env.DEBUG) {
    console.error(err)
  }
}
