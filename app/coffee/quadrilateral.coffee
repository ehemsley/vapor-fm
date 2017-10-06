module.exports = class Quadrilateral
  constructor: (mystifyQuadrilateral, vertices, velocities, bounds) ->
    @mystifyQuadrilateral = mystifyQuadrilateral

    @vertexOnePosition = vertices[0]
    @vertexTwoPosition = vertices[1]
    @vertexThreePosition = vertices[2]
    @vertexFourPosition = vertices[3]

    @vertexOneVelocity = velocities[0]
    @vertexTwoVelocity = velocities[1]
    @vertexThreeVelocity = velocities[2]
    @vertexFourVelocity = velocities[3]

    @leftBound = bounds[0]
    @rightBound = bounds[1]
    @topBound = bounds[2]
    @bottomBound = bounds[3]

    width = Math.abs(@leftBound - @rightBound)
    height = Math.abs(@topBound - @bottomBound)

    lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, opacity: 0.1, transparent: true})
    lineGeometry = new THREE.Geometry()

    color = new THREE.Color(0xffffff)

    lineGeometry.vertices.push(@vertexOnePosition)
    lineGeometry.vertices.push(@vertexTwoPosition)
    lineGeometry.vertices.push(@vertexThreePosition)
    lineGeometry.vertices.push(@vertexFourPosition)
    lineGeometry.vertices.push(@vertexOnePosition)

    @line = new THREE.Line(lineGeometry, lineMaterial)

    return

  Update: (deltaTime) =>
    @vertexOnePosition = @vertexOnePosition.add(new THREE.Vector3(@vertexOneVelocity.x,
                                                                  @vertexOneVelocity.y,
                                                                  @vertexOneVelocity.z))

    @vertexTwoPosition = @vertexTwoPosition.add(new THREE.Vector3(@vertexTwoVelocity.x,
                                                                  @vertexTwoVelocity.y,
                                                                  @vertexTwoVelocity.z))

    @vertexThreePosition = @vertexThreePosition.add(new THREE.Vector3(@vertexThreeVelocity.x,
                                                                      @vertexThreeVelocity.y,
                                                                      @vertexThreeVelocity.z))

    @vertexFourPosition = @vertexFourPosition.add(new THREE.Vector3(@vertexFourVelocity.x,
                                                                    @vertexFourVelocity.y,
                                                                    @vertexFourVelocity.z))

    @CheckBoundsAndAdjustVelocity(@vertexOnePosition, @vertexOneVelocity, 0)
    @CheckBoundsAndAdjustVelocity(@vertexTwoPosition, @vertexTwoVelocity, 1)
    @CheckBoundsAndAdjustVelocity(@vertexThreePosition, @vertexThreeVelocity, 2)
    @CheckBoundsAndAdjustVelocity(@vertexFourPosition, @vertexFourVelocity, 3)

    @line.geometry.verticesNeedUpdate = true

    return

  CheckBoundsAndAdjustVelocity: (vertexPosition, vertexVelocity, vertexIndex) ->
    xCollision = false
    yCollision = false

    if vertexPosition.x < @leftBound
      vertexPosition.setX(@leftBound)
      xCollision = true
    else if vertexPosition.x > @rightBound
      vertexPosition.setX(@rightBound)
      xCollision = true

    if vertexPosition.y < @bottomBound
      vertexPosition.setY(@bottomBound)
      yCollision = true
    else if vertexPosition.y > @topBound
      vertexPosition.setY(@topBound)
      yCollision = true

    if xCollision or yCollision
      if @mystifyQuadrilateral.IsLastVertexToCollide(@, vertexIndex)
        if xCollision
          newXVelocity = @RandomVelocityComponent(vertexVelocity.x)
          @mystifyQuadrilateral.FireQuadrilateralsInXDirection(vertexIndex, newXVelocity)
          @mystifyQuadrilateral.FireQuadrilateralsInYDirection(vertexIndex, vertexVelocity.y)
        if yCollision
          newYVelocity = @RandomVelocityComponent(vertexVelocity.y)
          @mystifyQuadrilateral.FireQuadrilateralsInYDirection(vertexIndex, newYVelocity)
          @mystifyQuadrilateral.FireQuadrilateralsInXDirection(vertexIndex, vertexVelocity.x)

      vertexVelocity.set(0, 0, 0)

    return

  ChangeColor: (newColor) =>
    @line.material.color.setHex(newColor)
    @line.material.needsUpdate = true

    return

  RandomVelocityComponent: (originalVelocity) ->
    if originalVelocity > 0
      return Math.min(Math.random() * -5, -1)
    else
      return Math.max(Math.random() * 5, 1)

  SetXVelocityOfVertex: (index, newXVelocity) =>
    if index == 0
      @vertexOneVelocity.setX(newXVelocity)
    else if index == 1
      @vertexTwoVelocity.setX(newXVelocity)
    else if index == 2
      @vertexThreeVelocity.setX(newXVelocity)
    else if index == 3
      @vertexFourVelocity.setX(newXVelocity)

    return

  SetYVelocityOfVertex: (index, newYVelocity) =>
    if index == 0
      @vertexOneVelocity.setY(newYVelocity)
    else if index == 1
      @vertexTwoVelocity.setY(newYVelocity)
    else if index == 2
      @vertexThreeVelocity.setY(newYVelocity)
    else if index == 3
      @vertexFourVelocity.setY(newYVelocity)

    return

  VelocityByIndex: (index) =>
    if index == 0
      return @vertexOneVelocity
    else if index == 1
      return @vertexTwoVelocity
    else if index == 2
      return @vertexThreeVelocity
    else if index == 3
      return @vertexFourVelocity
