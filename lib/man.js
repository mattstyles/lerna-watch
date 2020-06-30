
const pkg = require('../package.json')

module.exports = `
${pkg.name} ${pkg.version}

Usage: 

  ${pkg.name} <target>

Target is a package within the lerna-powered monorepo. 
The local dependency graph will be evaluated and scripts will begin to 
run in the target and its local dependencies. These scripts are defined
within lerna.json.
`
