
const create = require('errno').custom.createError

module.exports.TargetError = create('target')
module.exports.ProjectError = create('project')
