/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const THREE = require('three')

const axis = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)

module.exports = class Dolphin {
  constructor (dolphinObject) {
    this.Update = this.Update.bind(this)
    this.UpdatePosition = this.UpdatePosition.bind(this)
    this.UpdateRotation = this.UpdateRotation.bind(this)
    this.Finish = this.Finish.bind(this)

    const z = (Math.random() * -80) - 20
    const xStart = (Math.random() * 100) - 70
    const xDistance = (Math.random() * 50) + 50
    const jumpHeight = (Math.random() * 80) + 20

    this.jumpCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(xStart, -20, z),
      new THREE.Vector3(xStart + (xDistance * 0.5), jumpHeight, z),
      new THREE.Vector3(xStart + xDistance, -20, z)
    )

    this.object = dolphinObject
    this.object.position.set(xStart, -20, z)

    this.finished = false

    this.animationTimer = { time: 0 }
    this.tween = new TWEEN.Tween(this.animationTimer)
      .to({ time: 1 }, this.Lerp(4000, 2000, (jumpHeight - 20) / 80))
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete(() => {
        return this.Finish()
      })
  }

  Update () {
    this.UpdatePosition()
    this.UpdateRotation()
  }

  UpdatePosition () {
    this.object.position.copy(this.jumpCurve.getPoint(this.animationTimer.time))
  }

  UpdateRotation () {
    const tangent = this.jumpCurve.getTangent(this.animationTimer.time)
    axis.crossVectors(up, tangent).normalize()
    const radians = Math.acos(up.dot(tangent))
    this.object.quaternion.setFromAxisAngle(axis, radians)
    this.object.rotateOnAxis(axis, -Math.PI * 0.5)
  }

  Finish () {
    this.finished = true
  }

  Lerp (a, b, f) {
    return a + (f * (b - a))
  }
}
