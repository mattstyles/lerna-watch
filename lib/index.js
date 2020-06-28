
const Project = require('@lerna/project')
const PackageGraph = require('@lerna/package-graph')

const { TargetError, ProjectError } = require('./err')
const { logMapKeys } = require('./log')
const debug = require('debug')('lerna-watch')
const log = require('npmlog')
const {
  getTargetLocalDependencies,
  getConfigCommands,
  runCommand
} = require('./utils')

module.exports.watch = watch

/**
 * @param args <object>
 * @param args.target <string> top-level application target
 * @param args.project <?@lerna/project> project object
 * @param args.cwd <?string> only necessary if not passing a project
 */
function watch (args) {
  const project = args.project || new Project(args.cwd || '')

  if (!project) {
    const msg = args.cwd
      ? 'Project not found at location'
      : 'No project supplied'
    log.error(msg)
    throw new ProjectError(msg)
  }

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

  const commands = getConfigCommands(project)

  // Fire into target and dependency commands
  runCommand([target], commands.target)
  runCommand(Array.from(deps.values()), commands.watch)
}
