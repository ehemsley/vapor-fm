class @PongVisualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @scene = new THREE.Scene
    # @camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000)
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @bloomParams = { strength: 6, kernelSize: 6, sigma: 1.1, resolution: 512 }
    @noiseAmount = 0.15

    @playerPaddle = @Paddle()
    @enemyPaddle = @Paddle()
    @rightBound = @HorizontalBound()
    @leftBound = @HorizontalBound()
    @topBound = @VerticalBound()
    @bottomBound = @VerticalBound()

    @ball = @Ball()
    @ResetBall()
    @ballCollisionRaycaster = new THREE.Raycaster()

    @scene.add(@playerPaddle)
    @scene.add(@enemyPaddle)
    @scene.add(@ball)
    @scene.add(@rightBound)
    @scene.add(@leftBound)
    @scene.add(@topBound)
    @scene.add(@bottomBound)

    @playerPaddle.position.set(-20, 0, 0)
    @enemyPaddle.position.set(20, 0, 0)
    @ball.position.set(0, 0, 0)

    @rightBound.position.set(22, 0, 0)
    @leftBound.position.set(-22, 0, 0)
    @topBound.position.set(0, 15, 0)
    @bottomBound.position.set(0, -15, 0)

    @paddleSpeed = 16

    @ResetInputs()

    @camera.position.z = 20

    return

  Paddle: ->
    geometry = new THREE.BoxGeometry(1, 6, 1)
    material = new THREE.MeshBasicMaterial({color: 0xffffff})
    paddle = new THREE.Mesh(geometry, material)
    paddle

  Ball: ->
    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    material = new THREE.MeshBasicMaterial({color: 0xffffff})
    ball = new THREE.Mesh(geometry, material)
    ball

  HorizontalBound: ->
    geometry = new THREE.BoxGeometry(1, 30, 2)
    material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide})
    horBound = new THREE.Mesh(geometry, material)
    horBound

  VerticalBound: ->
    geometry = new THREE.BoxGeometry(40, 1, 2)
    material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide})
    verBound = new THREE.Mesh(geometry, material)
    verBound

  Update: (deltaTime) =>
    if deltaTime?
      if @playerPaddleUp
        @playerPaddle.position.y = @playerPaddle.position.y + @paddleSpeed * deltaTime
      else if @playerPaddleDown
        @playerPaddle.position.y = @playerPaddle.position.y - @paddleSpeed * deltaTime

      if @ballVelocity.x > 0
        enemyToBallDistance = @ball.position.y - @enemyPaddle.position.y
        if (enemyToBallDistance > 2)
          @enemyPaddle.position.y = @enemyPaddle.position.y + @paddleSpeed * 0.65 * deltaTime
        else if (enemyToBallDistance < 2)
          @enemyPaddle.position.y = @enemyPaddle.position.y - @paddleSpeed * 0.65 * deltaTime

      @ball.position.x += @ballVelocity.x * deltaTime
      @ball.position.y += @ballVelocity.y * deltaTime
      @ball.position.z += @ballVelocity.z * deltaTime

    @CheckBallCollision()

    return

  CheckBallCollision: =>
    @ballCollisionRaycaster.set(@ball.position.clone(), @ballVelocity.clone().normalize())
    intersects = @ballCollisionRaycaster.intersectObjects([@playerPaddle, @enemyPaddle, @leftBound, @topBound, @rightBound, @bottomBound])
    intersectObjects = []
    for intersect in intersects
      if intersect.distance < 1.5
        if intersect.object == @leftBound
          @ResetBall()
          return
        else if intersect.object == @rightBound
          @ResetBall()
          return
        else if intersect.object == @topBound
          @ballVelocity.y = -@ballVelocity.y
          return
        else if intersect.object == @bottomBound
          @ballVelocity.y = -@ballVelocity.y
          return
        else if intersect.object == @playerPaddle
          @ballVelocity.x = Math.max(-@ballVelocity.x + (Math.random() * 10), 8)
          return
        else if intersect.object == @enemyPaddle
          @ballVelocity.x = Math.min(-@ballVelocity.x + (Math.random() * -10), -8)
          return

  HandleKeyDownInput: (keyCode) =>
    if (keyCode == 65) #a key
      @PaddleUpInputPressed()
    else if (keyCode == 90) #z key
      @PaddleDownInputPressed()

    return

  HandleKeyUpInput: (keyCode) =>
    if (keyCode == 65) #a key
      @PaddleUpInputReleased()
    else if (keyCode == 90) #z key
      @PaddleDownInputReleased()

  PaddleUpInputPressed: =>
    @playerPaddleUp = true

  PaddleDownInputPressed: =>
    @playerPaddleDown = true

  PaddleUpInputReleased: =>
    @playerPaddleUp = false

  PaddleDownInputReleased: =>
    @playerPaddleDown = false

  ResetInputs: =>
    @playerPaddleDown = false
    @playerPaddleUp = false

    @enemyPaddleDown = false
    @enemyPaddleUp = false

  ResetBall: =>
    @ball.position.set(0,0,0)

    ballDirection = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0)
    @ballVelocity = ballDirection.clone().normalize().multiplyScalar(20.0)

