const path = require('path')

exports.app = (out, name) => path.join(out, name)

// A case closing its window must not take the app down with it, and WinUI shuts
// down once its last window has closed unless told to wait.
exports.setup = [
  `const Application = require('bare-win-ui/application')\n`,
  `Application.current.dispatcherShutdownMode = Application.DISPATCHER_SHUTDOWN_MODE.ON_EXPLICIT_SHUTDOWN\n`
].join('')

exports.args = []

exports.ignore = []
