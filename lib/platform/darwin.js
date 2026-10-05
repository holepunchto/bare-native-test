const path = require('path')

exports.app = (out, name) => path.join(out, name + '.app')

// A case closing its window must not take the app down with it.
exports.setup = `require('bare-app-kit').Application.shouldTerminateAfterLastWindowClosed = false\n`

// An app that went down unexpectedly can be offered its windows back on the
// next launch, behind a modal prompt that blocks the run.
exports.args = ['-ApplePersistenceIgnoreState', 'YES']

// AppKit reports the flag above on every launch.
exports.ignore = [/ApplePersistenceIgnoreState:/]
