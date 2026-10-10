const path = require('path')

exports.app = (out, name) => path.join(out, name + '.apk')

exports.setup = ''

exports.args = []

exports.ignore = [
  // ART reports its garbage collector on every launch
  /^Using [\w ]+ GC\.$/,
  // V8 sizes its heap from the cgroup limits, which apps are not allowed to read
  /avc: +denied +\{ search \} for +name="\/" dev="cgroup2"/,
  // WebViews that run in the app try APIs that Android blocks
  /^hiddenapi: .* from \/data\/app\/\S*\/com\.google\.android\.webview-/
]
