
const log = require('npmlog')

module.exports = {
  logMapKeys: function (map, ...args) {
    log.info(...args, Array.from(map.keys()).join(', '))
  }
}
