import { Clock } from 'three'

module.exports = class Timer {
  constructor () {
    this.clock = new Clock()
    this.clock.start()
    this.interval = 5
  }

  start (seconds) {
    this.interval = seconds
    this.clock.start()
    this.startTime = this.clock.getElapsedTime()
  }

  // TODO: SELF UPDATE?
  update () {
    if (this.clock.running) {
      if (this.clock.getElapsedTime() > this.startTime + this.interval) {
        this.clock.stop()
        this.finishCallback()
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
