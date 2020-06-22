
const Project = require('@lerna/project')
const PackageGraph = require('@lerna/package-graph')

const { TargetError } = require('./err')
const { logMapKeys } = require('./log')
const debug = require('debug')('lerna-watch')
const log = require('npmlog')
const {
  getTargetLocalDependencies,
  runCommand
} = require('./utils')

module.exports.watch = watch

/**
 * @param args <object>
 * @param args.cwd <?string> only necessary if not passing a project
 * @param args.target <string> top-level application target
 * @param args.project <@lerna/project> project object
 */
function watch (args) {
  // @TODO handle missing args, like cwd | project

  const project = args.project || new Project(args.cwd)

  if (!args.target) {
    const msg = 'No target supplied'
    log.error(msg)
    throw new TargetError(msg)
  }

  const packages = project.getPackagesSync()
  const graph = new PackageGraph(packages)
  const target = graph.get(args.target)

  if (!target) {
    const msg = 'Can not find package target'
    log.error(msg)
    throw new TargetError(msg)
  }

  debug(`Evaluating dependencies of target ${target.name}`)
  const deps = getTargetLocalDependencies(target, graph)

  log.info('target', target.name)
  logMapKeys(deps, 'local dependencies')

  // @TODO grab commands from lerna.json, project has these
  runCommand([target], 'start')

  // For dependencies grab the values, those are the graph nodes
  runCommand(Array.from(deps.values()), 'watch')
}
