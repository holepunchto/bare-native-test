/**
 * Build the tests at `entry` into an app for a device, launch it there, and stream its TAP output.
 * Resolves with `0` if the TAP output reports a complete run with no failures, and `1` otherwise.
 * How the app itself exits is not taken into account.
 */
declare function run(
  entry: string,
  opts?: {
    /** The directory that `entry` and `out` are relative to. Defaults to the working directory. */
    cwd?: string
    /** The platform to run on, such as `darwin` or `ios`. Defaults to the current platform. */
    platform?: string
    /**
     * The name of the device to run on. Defaults to this machine, or to a device of `platform` that
     * is already running.
     */
    device?: string | null
    /** The runtime to build the app with. Defaults to `bare-native/runtime`. */
    runtime?: string
    /** Where to write the entry point and the app. Defaults to `build/test`. */
    out?: string
    /** The name of the app. Defaults to `Tests`. */
    name?: string
    /** The identifier of the app. Defaults to `to.holepunch.bare.native.test`. */
    identifier?: string
    /**
     * A manifest template to build the Android app from, for tests that need permissions the
     * default manifest does not declare. Android only, and ignored elsewhere.
     */
    androidManifest?: string | null
    /**
     * Module specifiers to defer resolution of, for modules the tests pull in but that cannot be
     * bundled, such as a coverage reporter that imports Node builtins.
     */
    defer?: string[]
    /**
     * Give up on a run that stops making progress for this many milliseconds. Each case has a
     * timeout of its own, so this is only a backstop. Defaults to 5 minutes.
     */
    timeout?: number
  }
): Promise<number>

export = run
