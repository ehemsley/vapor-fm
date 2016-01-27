axis = new THREE.Vector3()
up = new THREE.Vector3(0, 1, 0)

module.exports = class Dolphin
  constructor: (dolphinObject) ->
    z = (Math.random() * -80) - 20
    xStart = (Math.random() * 100) - 70
    xDistance = (Math.random() * 50) + 50

    @jumpCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(xStart, -20, z),
      new THREE.Vector3(xStart + xDistance * 0.5, 100, z),
      new THREE.Vector3(xStart + xDistance, -20, z)
    )

    @object = dolphinObject
    @object.position.set(xStart, -20, z)

    @finished = false

    @animationTimer = { time: 0 }
    @tween = new TWEEN.Tween(@animationTimer)
      .to({ time: 1 }, 5000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .onComplete =>
        @Finish()

    return

  Update: =>
    @UpdatePosition()
    @UpdateRotation()
    return

  UpdatePosition: =>
    @object.position.copy(@jumpCurve.getPoint(@animationTimer.time))
    return

  UpdateRotation: =>
    tangent = @jumpCurve.getTangent(@animationTimer.time)
    axis.crossVectors(up, tangent).normalize()
    radians = Math.acos(up.dot(tangent))
    @object.quaternion.setFromAxisAngle(axis, radians)
    @object.rotateOnAxis(axis, -Math.PI * 0.5)
    return

  Finish: =>
    @finished = true
