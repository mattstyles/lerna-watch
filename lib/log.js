
const pkg = require('../package.json')
const log = require('npmlog')
const debug = require('debug')('lerna-watch')

module.exports = {
  log: function () {
    log.info(pkg.name, ...arguments)
  },
  err: function () {
    log.error(pkg.name, ...arguments)
  },
  debug: function () {
    debug(...arguments)
  },
  logMapKeys: function (map, ...args) {
    log.info(...args, Array.from(map.keys()).join(', '))
  }
}
