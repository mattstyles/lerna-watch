
const test = require('ava')

const { toMap, makeNode } = require('./fixtures')

const {
  createScopeArguments,
  getTargetLocalDependencies,
  get
} = require('../lib/utils')

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

test('Should be able to collect shallow local dependencies', t => {
  const graph = new Map()
  const dep1 = makeNode('dep1')
  const target = makeNode('target', toMap({ dep1: dep1 }))
  graph.set('target', target)
  graph.set('dep1', dep1)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    ['dep1'],
    'Map of keys matches expected shallow dependencies'
  )
})

test('Should be able to collect deep local dependencies', t => {
  const graph = new Map()
  const deep = makeNode('deep')
  const shallow = makeNode('shallow', toMap({ deep }))
  const target = makeNode('target', toMap({ shallow }))
  graph.set('target', target)
  graph.set('shallow', shallow)
  graph.set('deep', deep)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    ['shallow', 'deep'],
    'Map of keys matches expected deep dependencies'
  )
})

test('Should be able to collect deep and shallow local dependencies', t => {
  const graph = new Map()
  const deep = makeNode('deep')
  const shallowLeaf = makeNode('shallowLeaf')
  const shallow = makeNode('shallow', toMap({ deep }))
  const target = makeNode('target', toMap({ shallow, shallowLeaf }))
  graph.set('target', target)
  graph.set('shallowLeaf', shallowLeaf)
  graph.set('shallow', shallow)
  graph.set('deep', deep)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    ['shallow', 'deep', 'shallowLeaf'],
    'Map of keys matches expected deep dependencies'
  )
})

test('Should be able to collect multiple deep local dependencies', t => {
  const graph = new Map()
  const deep1 = makeNode('deep1')
  const deep2 = makeNode('deep2')
  const shallow1 = makeNode('shallow1', toMap({ deep1 }))
  const shallow2 = makeNode('shallow2', toMap({ deep2 }))
  const target = makeNode('target', toMap({ shallow1, shallow2 }))
  graph.set('deep1', deep1)
  graph.set('deep2', deep2)
  graph.set('shallow1', shallow1)
  graph.set('shallow2', shallow2)
  graph.set('target', target)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    ['shallow1', 'deep1', 'shallow2', 'deep2'],
    'Map of keys matches expected deep dependencies'
  )
})

test('Should remove duplicates', t => {
  const graph = new Map()
  const deepShared = makeNode('deepShared')
  const shallow1 = makeNode('shallow1', toMap({ deepShared }))
  const shallow2 = makeNode('shallow2', toMap({ deepShared }))
  const target = makeNode('target', toMap({ shallow1, shallow2 }))
  graph.set('deepShared', deepShared)
  graph.set('shallow1', shallow1)
  graph.set('shallow2', shallow2)
  graph.set('target', target)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    ['shallow1', 'deepShared', 'shallow2'],
    'Map of keys matches expected deep dependencies'
  )
})

test('Should work with no local dependencies', t => {
  const graph = new Map()
  const target = makeNode('target')
  graph.set('target', target)

  t.deepEqual(
    Array.from(getTargetLocalDependencies(target, graph).keys()),
    [],
    'No dependencies, no worries'
  )
})

test('getOrElse should accept a string path', t => {
  const expected = 'expected'
  const orElse = '🕶'
  const fixture = {
    foo: {
      bar: {
        baz: expected
      }
    }
  }
  t.is(get('foo.bar.baz', fixture).unwrap(), expected, 'unwraps gets the value')
  t.is(get('foo.quux', fixture).unwrap(), null, 'null otherwise')

  t.is(get('foo.bar.baz', fixture).orElse(orElse), expected, 'orElse returns the correct value')
  t.is(get('foo.quux', fixture).orElse(orElse), orElse, 'or else can be used to supply defaults')
})
