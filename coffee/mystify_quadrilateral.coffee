class @MystifyQuadrilateral
  constructor: (leftBound, rightBound, topBound, bottomBound) ->
    width = Math.abs(leftBound - rightBound)
    height = Math.abs(topBound - bottomBound)

    @vertexOnePosition = new THREE.Vector3((Math.random() * width * 0.5) - width * 0.25, height * 0.5, -10)
    @vertexTwoPosition = new THREE.Vector3(width * -0.5, (Math.random() * height * 0.5) - height * 0.25, -10)
    @vertexThreePosition = new THREE.Vector3((Math.random() * width * 0.5) - width * 0.25, height * -0.5, -10)
    @vertexFourPosition = new THREE.Vector3(width * 0.5, (Math.random() * height * 0.5) - height * 0.25, -10)

    @vertexOneVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) - 1, 0)
    @vertexTwoVelocity = new THREE.Vector3((Math.random() * 1) + 1, (Math.random() * 2) - 1, 0)
    @vertexThreeVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) + 1, 0)
    @vertexFourVelocity = new THREE.Vector3((Math.random() * 1) - 1, (Math.random() * 2) - 1, 0)

    @leftBound = leftBound
    @rightBound = rightBound
    @topBound = topBound
    @bottomBound = bottomBound

    @quadrilaterals = @Quadrilaterals(6)

    @nextCollisionXVelocity = (0 for [0..3])
    @nextCollisionYVelocity = (0 for [0..3])

    @timer = 0
    @colorChangeTime = @RandomColorChangeTime()

    @ChangeColors()

    return

  Quadrilaterals: (num) =>
    quadrilaterals = []

    vertexOneDirection = @vertexOneVelocity.clone().normalize()
    vertexTwoDirection = @vertexTwoVelocity.clone().normalize()
    vertexThreeDirection = @vertexThreeVelocity.clone().normalize()
    vertexFourDirection = @vertexFourVelocity.clone().normalize()

    for i in [0..num-1]
      vertexOne = @vertexOnePosition.clone().add(vertexOneDirection.clone().multiplyScalar(i * 20))
      vertexTwo = @vertexTwoPosition.clone().add(vertexTwoDirection.clone().multiplyScalar(i * 20))
      vertexThree = @vertexThreePosition.clone().add(vertexThreeDirection.clone().multiplyScalar(i * 20))
      vertexFour = @vertexFourPosition.clone().add(vertexFourDirection.clone().multiplyScalar(i * 20))
      quadrilateral = new Quadrilateral(@,
                                        vertexOne,
                                        vertexTwo,
                                        vertexThree,
                                        vertexFour,
                                        @vertexOneVelocity.clone(),
                                        @vertexTwoVelocity.clone(),
                                        @vertexThreeVelocity.clone(),
                                        @vertexFourVelocity.clone(),
                                        @leftBound,
                                        @rightBound,
                                        @topBound,
                                        @bottomBound)
      quadrilaterals.push(quadrilateral)

    return quadrilaterals


  Update: (deltaTime) =>
    @timer += deltaTime

    if @timer > @colorChangeTime
      @timer = 0
      @colorChangeTime = @RandomColorChangeTime()
      @ChangeColors()
      for quadrilateral, i in @quadrilaterals
        @SetColorChangeTimeout(quadrilateral, i, newColor)

    for quadrilateral in @quadrilaterals
      quadrilateral.Update(deltaTime)

    return

  RandomColorChangeTime: =>
    Math.random() * 30

  SetColorChangeTimeout: (quadrilateral, i, newColor) =>
    setTimeout ->
      quadrilateral.ChangeColor(newColor)
    , i * 100

    return

  ChangeColors: =>
    newColor = Math.random() * 0xffffff
    for quadrilateral, i in @quadrilaterals
      @SetColorChangeTimeout(quadrilateral, i, newColor)

  IsLastVertexToCollide: (currentQuadrilateral, vertexIndex) =>
    for iteratedQuadrilateral in @quadrilaterals
      if currentQuadrilateral != iteratedQuadrilateral
        if iteratedQuadrilateral.VelocityByIndex(vertexIndex).length() != 0
          return false

    return true

  FireQuadrilateralsInXDirection: (vertexIndex, newXVelocity) =>
    for quadrilateral, i in @quadrilaterals[..] by -1
    # for quadrilateral, i in @quadrilaterals
      @SetQuadrilateralFireInXDirectionTimeout(quadrilateral, i, vertexIndex, newXVelocity)
    return

  FireQuadrilateralsInYDirection: (vertexIndex, newYVelocity) =>
    for quadrilateral, i in @quadrilaterals[..] by -1
    # for quadrilateral, i in @quadrilaterals
      @SetQuadrilateralFireInYDirectionTimeout(quadrilateral, i, vertexIndex, newYVelocity)
    return

  SetQuadrilateralFireInXDirectionTimeout: (quadrilateral, quadIndex, vertexIndex, newXVelocity) =>
    setTimeout ->
      quadrilateral.SetXVelocityOfVertex(vertexIndex, newXVelocity)
    , quadIndex * 100

    return

  SetQuadrilateralFireInYDirectionTimeout: (quadrilateral, quadIndex, vertexIndex, newYVelocity) =>
    setTimeout ->
      quadrilateral.SetYVelocityOfVertex(vertexIndex, newYVelocity)
    , quadIndex * 100

    return
