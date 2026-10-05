// Only the top level is read, as each case reports the result of what it nests.
module.exports = class TAPResult {
  constructor() {
    this.planned = null
    this.count = 0
    this.failed = 0
    this.bailed = false
  }

  get done() {
    return this.bailed || (this.planned !== null && this.count >= this.planned)
  }

  get ok() {
    return !this.bailed && this.failed === 0 && this.planned === this.count
  }

  push(line) {
    if (line.startsWith('Bail out!')) {
      this.bailed = true
      return
    }

    let match = /^1\.\.(\d+)/.exec(line)

    if (match) {
      this.planned = Number(match[1])
      return
    }

    match = /^(not )?ok\b(.*)$/.exec(line)

    if (match === null) return

    this.count++

    if (match[1] && !/#\s*todo\b/i.test(match[2])) this.failed++
  }
}
