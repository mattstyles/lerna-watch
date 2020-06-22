
module.exports = {
  toMap,
  makeNode
}

function toMap (obj) {
  const map = new Map()
  for (const [k, v] of Object.entries(obj)) {
    map.set(k, v)
  }
  return map
}

function makeNode (name, map) {
  return {
    name: name,
    localDependencies: map || new Map()
  }
}
