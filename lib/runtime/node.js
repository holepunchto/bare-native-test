Object.defineProperty(exports, 'exitCode', {
  get() {
    return process.exitCode
  },
  set(code) {
    process.exitCode = code
  }
})
