const fs = require('fs')
const path = require('path')
const bareBuild = require('bare-build')
const { find } = require('bare-device')
const TAPResult = require('./lib/tap')

const platforms = {
  darwin: require('./lib/platform/darwin'),
  ios: require('./lib/platform/ios'),
  android: require('./lib/platform/android'),
  linux: require('./lib/platform/linux'),
  win32: require('./lib/platform/win32')
}

module.exports = async function run(entry, opts = {}) {
  const {
    cwd = path.resolve('.'),
    device: query = null,
    runtime = 'bare-native/runtime',
    name = 'Tests',
    identifier = 'to.holepunch.bare.native.test',
    androidManifest = null,
    timeout = 5 * 60 * 1000
  } = opts

  const out = path.resolve(cwd, opts.out || path.join('build', 'test'))

  const device = await find({ platform: opts.platform, name: query })

  const platform = platforms[device.platform]

  if (platform === undefined) throw new Error(`Unsupported platform '${device.platform}'`)

  const app = await build(generate(entry, platform, cwd, out), {
    app: platform.app(out, name),
    name,
    identifier,
    host: device.host,
    runtime,
    androidManifest,
    cwd,
    out
  })

  if (app === null) return 1

  await device.install(app, { grant: true })

  const result = await report(await device.launch(app, { args: platform.args }), platform, timeout)

  return result.ok ? 0 : 1
}

function generate(entry, platform, cwd, out) {
  fs.mkdirSync(out, { recursive: true })

  const wrapper = path.join(out, 'entry.js')

  let source = platform.setup

  source += `\nrequire(${JSON.stringify(relative(out, path.resolve(cwd, entry)))})\n`

  fs.writeFileSync(wrapper, source)

  return wrapper
}

// A specifier is separated by `/` on every platform.
function relative(from, to) {
  const result = path.relative(from, to).split(path.sep).join('/')

  return result.startsWith('.') ? result : './' + result
}

async function build(entry, opts) {
  const { app, name, identifier, host, runtime, cwd, out } = opts

  fs.rmSync(app, { recursive: true, force: true })

  try {
    for await (const _ of bareBuild(entry, {
      base: cwd,
      name,
      identifier,
      hosts: [host],
      runtime,
      out
    })) {
      //
    }
  } catch (err) {
    console.log('Bail out! The test app did not build')

    comment(err.stack)

    return null
  }

  return app
}

// The run is judged by its TAP output, never by how the app exits.
async function report(app, platform, timeout) {
  const result = new TAPResult()

  let finish
  const finished = new Promise((resolve) => {
    finish = resolve
  })

  const ended = lines(app.stdout, (line) => {
    console.log(line)

    result.push(line)

    if (result.done) finish()
  })

  lines(app.stderr, (line) => {
    if (!platform.ignore.some((pattern) => pattern.test(line))) comment(line)
  })

  Promise.all([app.exited, ended]).then(finish)

  // Each case has a timeout of its own, so this only catches a stalled run.
  const timer = setTimeout(() => {
    console.log(`Bail out! Timed out after ${timeout} ms`)

    result.bailed = true

    finish()
  }, timeout)

  await finished

  clearTimeout(timer)

  if (!result.done) {
    console.log('Bail out! The app stopped before the end of its plan')

    comment(status(await app.exited))

    result.bailed = true
  }

  await app.close()

  return result
}

function lines(stream, online) {
  return new Promise((resolve) => {
    let buffered = ''

    stream
      .on('data', (data) => {
        const parts = (buffered + data.toString()).split(/\r?\n/)

        buffered = parts.pop()

        for (const line of parts) online(line)
      })
      .on('end', () => {
        if (buffered !== '') online(buffered)

        resolve()
      })
  })
}

// A platform that does not report how an app exits leaves both unset. Windows
// reports a crash as an NTSTATUS code, which is looked up in hex.
function status({ code, signal }) {
  if (signal !== null) return `The app was killed by ${signal}`

  if (code === null) return ''

  if (code > 0xff) return `The app exited with code 0x${code.toString(16).toUpperCase()}`

  return `The app exited with code ${code}`
}

function comment(output) {
  for (const line of output.split('\n')) {
    if (line !== '') console.log('# ' + line)
  }
}
