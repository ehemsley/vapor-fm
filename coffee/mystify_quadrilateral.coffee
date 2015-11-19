class @MystifyQuadrilateral
  constructor: (leftBound, rightBound, topBound, bottomBound) ->
    width = Math.abs(leftBound - rightBound)
    height = Math.abs(topBound - bottomBound)

    @vertexOnePosition = new THREE.Vector3((Math.random() * width) - width * 0.5, height * 0.5, -10)
    @vertexTwoPosition = new THREE.Vector3(width * -0.5, (Math.random() * height ) - height * 0.5, -10)
    @vertexThreePosition = new THREE.Vector3((Math.random() * width) - width * 0.5, height * -0.5, -10)
    @vertexFourPosition = new THREE.Vector3(width * 0.5, (Math.random() * height) - height * 0.5, -10)

    console.log(@vertexOnePosition)

    @vertexOneVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) - 1, 0)
    @vertexTwoVelocity = new THREE.Vector3((Math.random() * 1) + 1, (Math.random() * 2) - 1, 0)
    @vertexThreeVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) + 1, 0)
    @vertexFourVelocity = new THREE.Vector3((Math.random() * 1) - 1, (Math.random() * 2) - 1, 0)

    @leftBound = leftBound
    @rightBound = rightBound
    @topBound = topBound
    @bottomBound = bottomBound

    @quadrilaterals = @Quadrilaterals(4)

    @timer = 0
    @colorChangeTime = @RandomColorChangeTime()

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
      quadrilaterals.push(new Quadrilateral(vertexOne,
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
                                             @bottomBound))

    return quadrilaterals


  Update: (deltaTime) =>
    @timer += deltaTime

    if @timer > @colorChangeTime
      @timer = 0
      @colorChangeTime = @RandomColorChangeTime()
      newColor = Math.random() * 0xffffff
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
