
const spawn = require('cross-spawn')
const debug = require('debug')('lerna-watch')

const { commands } = require('./defaultConfig')

module.exports = {
  getTargetLocalDependencies,
  runCommand,
  createScopeArguments,
  getPackageName,
  get,
  getConfigCommands
}

/**
 * @param {Map} collection - warning this function mutates map
 * @param {PackageNode} node - individual node from @lerna/graph
 * @param {PackageGraph} graph - @lerna/graph of packages
 */
function getNodeDependencies (collection, node, graph) {
  debug('Evaluating', node.name, 'dependencies')
  if (!node || !node.localDependencies || !node.localDependencies.size) {
    debug(node.name, ': Leaf node')
    return collection
  }

  node.localDependencies.forEach(child => {
    debug('Adding node', child.name)
    collection.set(child.name, child)
    getNodeDependencies(collection, graph.get(child.name), graph)
  })

  return collection
}

/**
 * @param {PackageNode} target - individual node from @lerna/package-graph
 * @param {PackageGraph} graph - @lerna/package-graph of packages
 * @returns {Map} map of all local dependencies of target
 */
function getTargetLocalDependencies (target, graph) {
  return getNodeDependencies(new Map(), target, graph)
}

/**
 * Pulls the id out of the @lerna/package-graph package representation
 * @param {Package} node - @lerna/package-graph
 */
function getPackageName (node) {
  return node.name
}

/**
 * Creates an argument string for scopes from a list of package names
 * @param {string[]} scopes - each scope to convert
 */
function createScopeArguments (targets) {
  return targets.map(target => `--scope ${target}`).join(' ')
}

/**
 * Attempts to run a command in target packages
 * @param {PackageNode[]} targets - node from @lerna/package-graph
 */
function runCommand (targets, command) {
  const scopeArguments = createScopeArguments(targets.map(getPackageName))

  debug(`lerna run ${command} ${scopeArguments}`)
  spawn(`npx lerna run ${command} ${scopeArguments} --stream --parallel`, {
    stdio: 'inherit',
    shell: true
  })
}

function get (path, obj) {
  const parts = path.split('.')
  const value = parts.reduce((v, _) => {
    return v && v[_]
      ? v[_]
      : null
  }, obj)
  return {
    unwrap: () => value,
    orElse: _ => typeof value === 'undefined' || value === null
      ? _
      : value
  }
}

/**
 * Attempts to grab lerna config from a project
 * @param {@lerna/Project} project - lerna project to use config from
 */
function getConfigCommands (project) {
  return get('config.watch.commands', project).orElse(commands)
}
