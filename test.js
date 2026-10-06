const test = require('brittle')
const path = require('bare-path')
const os = require('bare-os')
const { spawn } = require('bare-subprocess')

const timeout = 5 * 60 * 1000

test('passing tests', { timeout }, async (t) => {
  const { status, stdout } = await cli('pass')

  t.is(status, 0)
  t.ok(stdout.includes('ok 1 - passes'))
})

test('failing tests', { timeout }, async (t) => {
  const { status, stdout } = await cli('fail')

  t.is(status, 1)
  t.ok(stdout.includes('not ok 1 - fails'))
})

function cli(fixture) {
  const subprocess = spawn(
    os.execPath(),
    [
      path.join(__dirname, 'bin.js'),
      '--out',
      path.join('build', 'test', fixture),
      path.join('test', 'fixtures', fixture + '.js')
    ],
    { cwd: __dirname, stdio: ['ignore', 'pipe', 'inherit'] }
  )

  let stdout = ''

  subprocess.stdout.on('data', (data) => {
    stdout += data.toString()
  })

  return new Promise((resolve) => {
    subprocess.on('exit', (status) => resolve({ status, stdout }))
  })
}
