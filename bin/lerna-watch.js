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

const targets = argv._

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
    targets: targets
  })
} catch (err) {
  // suppress errors in cli mode
  if (process.env.DEBUG) {
    console.error(err)
  }
}
