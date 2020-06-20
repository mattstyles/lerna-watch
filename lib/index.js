
const Project = require('@lerna/project')
const PackageGraph = require('@lerna/package-graph')

const { TargetError } = require('./err')
const { debug, err, logMapKeys } = require('./log')
const { getTargetLocalDependencies } = require('./utils')

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

  // console.log('lerna-watch', args)
  debug('Watch', args)

  if (!args.target) {
    const msg = 'No target supplied'
    err(msg)
    throw new TargetError(msg)
  }

  const packages = project.getPackagesSync()
  const graph = new PackageGraph(packages)
  const target = graph.get(args.target)

  if (!target) {
    const msg = 'Can not find package target'
    err(msg)
    throw new TargetError(msg)
  }

  debug(`Evaluating dependencies of ${target.name}`)
  const deps = getTargetLocalDependencies(target, graph)

  logMapKeys(deps, `${target.name} local dependencies:`)
}
