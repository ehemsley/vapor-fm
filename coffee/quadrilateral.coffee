class @Quadrilateral
  constructor: (vertexOne, vertexTwo, vertexThree, vertexFour, velocityOne, velocityTwo, velocityThree, velocityFour, leftBound, rightBound, topBound, bottomBound) ->
    width = Math.abs(leftBound - rightBound)
    height = Math.abs(topBound - bottomBound)

    @vertexOnePosition = vertexOne
    @vertexTwoPosition = vertexTwo
    @vertexThreePosition = vertexThree
    @vertexFourPosition = vertexFour

    lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff})
    lineGeometry = new THREE.Geometry()

    lineGeometry.vertices.push(@vertexOnePosition)
    lineGeometry.vertices.push(@vertexTwoPosition)
    lineGeometry.vertices.push(@vertexThreePosition)
    lineGeometry.vertices.push(@vertexFourPosition)
    lineGeometry.vertices.push(@vertexOnePosition)

    @line = new THREE.Line(lineGeometry, lineMaterial)

    @vertexOneVelocity = velocityOne
    @vertexTwoVelocity = velocityTwo
    @vertexThreeVelocity = velocityThree
    @vertexFourVelocity = velocityFour

    @leftBound = leftBound
    @rightBound = rightBound
    @topBound = topBound
    @bottomBound = bottomBound

    return

  Update: (deltaTime) =>
    @vertexOnePosition = @vertexOnePosition.add(new THREE.Vector3(@vertexOneVelocity.x * deltaTime, @vertexOneVelocity.y * deltaTime, @vertexOneVelocity.z * deltaTime))
    @vertexTwoPosition = @vertexTwoPosition.add(new THREE.Vector3(@vertexTwoVelocity.x * deltaTime, @vertexTwoVelocity.y * deltaTime, @vertexTwoVelocity.z * deltaTime))
    @vertexThreePosition = @vertexThreePosition.add(new THREE.Vector3(@vertexThreeVelocity.x * deltaTime, @vertexThreeVelocity.y * deltaTime, @vertexThreeVelocity.z * deltaTime))
    @vertexFourPosition = @vertexFourPosition.add(new THREE.Vector3(@vertexFourVelocity.x * deltaTime, @vertexFourVelocity.y * deltaTime, @vertexFourVelocity.z * deltaTime))

    @CheckBoundsAndAdjustVelocity(@vertexOnePosition, @vertexOneVelocity)
    @CheckBoundsAndAdjustVelocity(@vertexTwoPosition, @vertexTwoVelocity)
    @CheckBoundsAndAdjustVelocity(@vertexThreePosition, @vertexThreeVelocity)
    @CheckBoundsAndAdjustVelocity(@vertexFourPosition, @vertexFourVelocity)

    @line.geometry.verticesNeedUpdate = true

    return

  CheckBoundsAndAdjustVelocity: (vertexPosition, vertexVelocity) ->
    if vertexPosition.x < @leftBound
      vertexPosition.setX(@leftBound)
      vertexVelocity.setX(-vertexVelocity.x)
    else if vertexPosition.x > @rightBound
      vertexPosition.setX(@rightBound)
      vertexVelocity.setX(-vertexVelocity.x)

    if vertexPosition.y < @bottomBound
      vertexPosition.setY(@bottomBound)
      vertexVelocity.setY(-vertexVelocity.y)
    else if vertexPosition.y > @topBound
      vertexPosition.setY(@topBound)
      vertexVelocity.setY(-vertexVelocity.y)

    return
