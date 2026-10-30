#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { command, arg, flag, summary } = require('paparam')
const pkg = require('./package')
const program = require('#runtime')
const run = require('.')

const cmd = command(
  pkg.name,
  summary(pkg.description),
  arg('<entry>', 'The entry point of the tests'),
  flag('--version|-v', 'Print the current version'),
  flag('--config <path>', 'Read bare-build options from a module'),
  flag('--before <path>', 'A module to run on this machine before the app is launched'),
  flag('--after <path>', 'A module to run on this machine after the run'),
  flag('--platform <name>', 'The platform to run on (default: the current platform)'),
  flag('--device|-d <name>', 'The name of the device to run on'),
  flag('--runtime <specifier>', 'The runtime to use (default: bare-native/runtime)'),
  flag('--out|-o <dir>', 'The output directory (default: build/test)'),
  flag('--android-manifest <path>', 'The Android manifest template'),
  flag('--defer <specifier>', 'A module specifier to defer resolution of').multiple(),
  flag(
    '--env <NAME=VALUE>',
    'An environment variable to set for the app, or @<path> or - to read them from a file or stdin'
  ).multiple(),
  flag('--timeout <ms>', 'Give up on a run that stops making progress for this long'),
  async ({ args, flags }) => {
    const { version, platform, device, runtime, out, androidManifest, defer, env, timeout } = flags

    if (version) return console.log(`v${pkg.version}`)

    const config = load(flags.config)
    const before = load(flags.before)
    const after = load(flags.after)

    program.exitCode = await run(args.entry, {
      platform,
      device,
      runtime,
      out,
      androidManifest,
      defer,
      env: variables(env),
      config,
      before,
      after,
      timeout: timeout ? Number(timeout) : undefined
    })
  }
)

function variables(entries = []) {
  const result = {}

  for (const entry of entries) {
    for (const line of expand(entry)) {
      const i = line.indexOf('=')

      if (i === -1) throw new Error(`Expected NAME=VALUE, got '${line}'`)

      result[line.slice(0, i)] = line.slice(i + 1)
    }
  }

  return result
}

function expand(entry) {
  if (entry === '-') return lines(stdin())
  if (entry.startsWith('@')) return lines(fs.readFileSync(entry.slice(1), 'utf8'))
  return [entry]
}

function lines(input) {
  return input.split(/\r?\n/).filter((line) => line !== '' && !line.startsWith('#'))
}

function stdin() {
  const chunks = []
  const buffer = Buffer.alloc(65536)

  let length

  while ((length = fs.readSync(0, buffer)) > 0) {
    chunks.push(Buffer.from(buffer.subarray(0, length)))
  }

  return Buffer.concat(chunks).toString()
}

function load(specifier) {
  if (!specifier) return undefined

  const module = require(path.resolve(specifier))

  return 'default' in module ? module.default : module
}

cmd.parse()
