import { Clock } from 'three'

module.exports = class Timer {
  constructor () {
    this.clock = new Clock()
    this.clock.start()
  }

  start (seconds) {
    this.startTime = this.clock.getElapsedTime()
    this.interval = seconds
  }

  // TODO: SELF UPDATE?
  update () {
    if (this.clock.running) {
      if (this.clock.getElapsedTime() > this.startTime + this.interval) {
        this.finishCallback()
        this.clock.stop()
      }
    }
  }

  stop () {
    this.clock.stop()
  }

  setFinishCallback (callback) {
    this.finishCallback = callback
  }
}
