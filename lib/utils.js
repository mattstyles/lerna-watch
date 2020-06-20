
const chalk = require('chalk')
const { debug } = require('./log')

module.exports.getTargetLocalDependencies = getTargetLocalDependencies

/**
 * @param {Map} collection - warning this function mutates map
 * @param {PackageNode} node - individual node from @lerna/graph
 * @param {PackageGraph} graph - @lerna/graph of packages
 */
function getNodeDependencies (collection, node, graph) {
  debug('Evaluating', chalk.yellow(node.name), 'dependencies')
  if (!node || !node.localDependencies.size) {
    debug(chalk.yellow(node.name), 'Leaf node')
    return
  }

  node.localDependencies.forEach(child => {
    debug(chalk.green('Adding node'), child.name)
    collection.set(child.name, child)
    getNodeDependencies(collection, graph.get(child.name), graph)
  })

  return collection
}

/**
 * @param {PackageNode} target - individual node from @lerna/graph
 * @param {PackageGraph} graph - @lerna/graph of packages
 * @returns {Map} map of all local dependencies of target
 */
function getTargetLocalDependencies (target, graph) {
  return getNodeDependencies(new Map(), target, graph)
}
