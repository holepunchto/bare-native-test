const path = require('path')

exports.app = (out, name) => path.join(out, name + '.AppDir')

// A case closing its window must not take the app down with it, and GTK quits
// an application once it has no windows unless something holds it.
exports.setup = `require('bare-gtk/application').getDefault().hold()\n`

exports.args = []

exports.ignore = []
