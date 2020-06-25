
const test = require('ava')

const { TargetError } = require('../lib/err')
const { watch } = require('../lib/index')

test('It should throw when bad args are supplied', t => {
  t.throws(() => {
    watch({ cwd: process.cwd() })
  }, { instanceOf: TargetError }, 'no target')

  t.throws(() => {
    watch()
  }, { instanceOf: TypeError }, 'no arguments')

  t.throws(() => {
    watch({ target: 'foo' })
  })
})
