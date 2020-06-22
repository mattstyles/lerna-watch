
const test = require('ava')

const { createScopeArguments } = require('../lib/utils')

test('Scoped argument string is correctly formatted', t => {
  t.is(
    createScopeArguments(['foo']),
    '--scope foo',
    'Single element array is good'
  )
  t.is(
    createScopeArguments(['foo', 'bar', 'baz']),
    '--scope foo --scope bar --scope baz',
    'Multiple elements in array are formatted correctly'
  )
})
