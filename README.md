# bare-native-test

Run tests inside native apps built with Bare. Layout and drawing only happen while the platform event loop is running, so the tests are built into an app and run there. The module runs under both Bare and Node.js, and a [CLI](#cli) is also included.

```
npm i [-g] bare-native-test
```

The default runtime is `bare-native/runtime`, so `bare-native` is expected to be installed alongside, unless another runtime is passed.

## Usage

Declare test cases with `bare-tap`:

`test/window.js`

```js
const { test } = require('bare-tap')
const { Window } = require('bare-app-kit')

test('lays out the window', async (t) => {
  const window = new Window({ width: 300, height: 200 })
  t.teardown(() => window.close())

  window.makeKeyAndOrderFront()

  t.equal(window.contentView.frame.width, 300)
})
```

Require the test modules from an entry point:

`test.js`

```js
require('./test/window')
```

Then run the entry point:

```js
const run = require('bare-native-test')

const exitCode = await run('test.js', { runtime: 'bare-app-kit/runtime' })
```

The entry point is built into an app with <https://github.com/holepunchto/bare-build> for a device found with <https://github.com/holepunchto/bare-device>, and the output of the app is streamed as TAP. The run is judged by that output alone: it passes when the plan is complete and no test failed, however the app exits.

The app is installed with its runtime permissions already granted, so a test never waits on a permission dialog. On Android they still have to be declared, which the default manifest does not do.

## CLI

#### `bare-native-test [flags] <entry>`

Build the tests at `<entry>` into an app for a device, launch it there, and stream its TAP output. Exits with `0` if the output reports a complete run with no failures, and `1` otherwise.

```console
--version|-v
--platform <name>
--device|-d <name>
--runtime <specifier>
--out|-o <dir>
--timeout <ms>
--help|-h
```

| Flag                 | Default                           | Description                                               |
| -------------------- | --------------------------------- | --------------------------------------------------------- |
| `--platform`         | The current platform              | The platform to run on, such as `darwin` or `ios`         |
| `--device`           | This machine, or a running device | The name of the device to run on                          |
| `--runtime`          | `bare-native/runtime`             | The runtime to build the app with                         |
| `--out`              | `build/test`                      | Where to write the entry point and the app                |
| `--android-manifest` | The default manifest              | A manifest template to build the Android app from         |
| `--timeout`          | 5 minutes                         | Give up on a run that stops making progress for this long |

## License

Apache-2.0
