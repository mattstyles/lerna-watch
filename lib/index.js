
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
 * @param args.targets <string[]> top-level application target
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

  if (args.target && !args.targets) {
    args.targets = [args.target]
  }

  if (!args.targets) {
    const msg = 'No target(s) supplied'
    log.error(msg)
    throw new TargetError(msg)
  }

  const packages = project.getPackagesSync()
  const graph = new PackageGraph(packages)

  const targets = args.targets.reduce((targets, targetName) => {
    const target = graph.get(targetName)
    if (!target) {
      log.error(`Can not find package ${targetName}, ignoring`)
    } else {
      targets = targets.concat(target)
    }
    return targets
  }, [])

  if (targets.length === 0) {
    const msg = 'No valid packages found.'
    log.error(msg)
    throw new TargetError(msg)
  }

  const deps = new Map()
  for (const target of targets) {
    debug(`Evaluating dependencies of target ${target.name}`)
    const targetDeps = getTargetLocalDependencies(target, graph)

    log.info('target', target.name)
    logMapKeys(targetDeps, 'local dependencies')

    targetDeps.forEach((dep) => deps.set(dep.name, dep))
  }

  const commands = getConfigCommands(project)

  // Fire into target and dependency commands
  runCommand(targets, commands.target)
  runCommand(Array.from(deps.values()), commands.watch)
}
