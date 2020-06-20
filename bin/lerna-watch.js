#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const { watch } = require('../lib')

const targetName = argv._[0]

try {
  watch({
    cwd: process.cwd(),
    target: targetName
  })
} catch (err) {
  // suppress errors in cli mode
}
