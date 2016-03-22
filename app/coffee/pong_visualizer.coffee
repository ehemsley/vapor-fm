Visualizer = require('coffee/visualizer')

module.exports = class PongVisualizer extends Visualizer
  constructor: (audioInitializer) ->
    super(audioInitializer,
          { strength: 3, kernelSize: 12, sigma: 1.1, resolution: 512 },
          0.15,
          2.0,
          false)

    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @playerPaddle = @Paddle()
    @enemyPaddle = @Paddle()
    @rightBound = @HorizontalBound()
    @leftBound = @HorizontalBound()
    @topBound = @VerticalBound()
    @bottomBound = @VerticalBound()

    @ball = @Ball()
    @ball.position.set(0, 0, 0)
    @ResetBall()
    @ballCollisionRaycaster = new THREE.Raycaster()

    @scene.add(@playerPaddle)
    @scene.add(@enemyPaddle)
    @scene.add(@ball)
    @scene.add(@rightBound)
    @scene.add(@leftBound)
    @scene.add(@topBound)
    @scene.add(@bottomBound)

    @midlines = @Midlines(0, -40, 40, 2, 2)
    for line in @midlines
      @scene.add(line)

    @playerScore = 0
    @enemyScore = 0

    @InitializeHud()
    @UpdateScoreDisplay()

    @ResetPaddles()

    @rightBound.position.set(22, 0, 0)
    @leftBound.position.set(-22, 0, 0)
    @topBound.position.set(0, 15, 0)
    @bottomBound.position.set(0, -15, 0)

    @paddleSpeed = 18

    @ResetInputs()

    @camera.position.z = 20

    @gameOver = false
    @resetTimer = 0

    return

  Activate: =>
    @ResetGame()

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

  Midlines:(x, bottom_y, top_y, size, space) ->
    lines = []
    for y in [bottom_y..top_y] by size+space
      lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff})
      geometry = new THREE.Geometry()
      geometry.vertices.push(new THREE.Vector3(x, y))
      geometry.vertices.push(new THREE.Vector3(x, y+size))
      line = new THREE.Line(geometry, lineMaterial)
      lines.push(line)
    lines

  HorizontalBound: ->
    geometry = new THREE.BoxGeometry(1, 30, 2)
    material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide})
    horBound = new THREE.Mesh(geometry, material)
    horBound

  VerticalBound: ->
    geometry = new THREE.BoxGeometry(45, 1, 2)
    material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide})
    verBound = new THREE.Mesh(geometry, material)
    verBound

  InitializeHud: =>
    @canvas1 = document.createElement('canvas')
    @canvas1.width = 120
    @canvas1.height = 60
    @context1 = @canvas1.getContext('2d')
    @context1.font = "30px TelegramaRaw"
    @context1.textAlign = "left"
    @context1.textBaseline = "top"
    @context1.fillStyle = "rgba(255,255,255,0.95)"
    @context1.strokeStyle = 'white'
    @context1.lineWidth = 2

    @context1.fillText('press i for info...', 0, 0)
    # @context1.fillRect(0, 0, @canvas1.width, @canvas1.height)

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true
    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), @material1)
    @mesh1.position.set(0, 10, 0)
    @scene.add(@mesh1)

    return

  UpdateScoreDisplay: =>
    @context1.clearRect(0, 0, @canvas1.width, @canvas1.height)
    @context1.fillStyle = 'white'
    @context1.textAlign = "left"
    @context1.fillText(@playerScore, 10, 0)
    @context1.textAlign = "right"
    @context1.fillText(@enemyScore, 110, 0)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  UpdateWinDisplay: (text) =>
    @context1.clearRect(0, 0, @canvas1.width, @canvas1.height)
    @context1.fillStyle = 'white'
    @context1.textAlign = "left"
    @context1.fillText(text, 20, 0)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  Update: (deltaTime) =>
    if deltaTime?
      if @gameOver
        if @resetTimer > 0
          @resetTimer -= deltaTime
        else
          @ResetGame()
        return
      else
        @CheckWin()

      if @playerPaddleUp
        @playerPaddle.position.y = Math.min(@playerPaddle.position.y + @paddleSpeed * deltaTime, 14)
      else if @playerPaddleDown
        @playerPaddle.position.y = Math.max(@playerPaddle.position.y - @paddleSpeed * deltaTime, -14)

      if @ballVelocity.x > 0
        enemyToBallDistance = @ball.position.y - @enemyPaddle.position.y
        if (enemyToBallDistance > 0.2)
          @enemyPaddle.position.y = @enemyPaddle.position.y + @paddleSpeed * 0.8 * deltaTime
        else if (enemyToBallDistance < 0.2)
          @enemyPaddle.position.y = @enemyPaddle.position.y - @paddleSpeed * 0.8 * deltaTime

      @ball.position.x += @ballVelocity.x * deltaTime
      @ball.position.y += @ballVelocity.y * deltaTime
      @ball.position.z += @ballVelocity.z * deltaTime

    @CheckBallCollision()

    return

  CheckBallCollision: =>
    @ballCollisionRaycaster.set(@ball.position.clone(), @ballVelocity.clone().normalize())
    intersects = @ballCollisionRaycaster.intersectObjects([@playerPaddle,
                                                           @enemyPaddle,
                                                           @leftBound,
                                                           @topBound,
                                                           @rightBound,
                                                           @bottomBound])
    intersectObjects = []
    for intersect in intersects
      if intersect.distance < 1.5
        if intersect.object == @leftBound
          @enemyScore += 1
          @UpdateScoreDisplay()
          @ResetBall()
          return
        else if intersect.object == @rightBound
          @playerScore += 1
          @UpdateScoreDisplay()
          @ResetBall()
          return
        else if intersect.object == @topBound
          @ballVelocity.y = -@ballVelocity.y
          return
        else if intersect.object == @bottomBound
          @ballVelocity.y = -@ballVelocity.y
          return
        else if intersect.object == @playerPaddle
          @ballVelocity.x = -@ballVelocity.x
          @ballVelocity.y = (intersect.point.y - @playerPaddle.position.y) * 8
          @ballVelocity.normalize().multiplyScalar(38.0)
          return
        else if intersect.object == @enemyPaddle
          @ballVelocity.x = -@ballVelocity.x
          @ballVelocity.y = (intersect.point.y - @enemyPaddle.position.y) * 8
          @ballVelocity.normalize().multiplyScalar(38.0)
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

    return

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

    ballDirection = new THREE.Vector3((if Math.random() < 0.5 then -1 else 1), Math.random() * 0.8 - 0.4, 0)
    @ballVelocity = ballDirection.clone().normalize().multiplyScalar(25.0)

    return

  ResetPaddles: =>
    @playerPaddle.position.set(-20, 0, 0)
    @enemyPaddle.position.set(20, 0, 0)

    return

  ResetGame: =>
    @playerScore = 0
    @enemyScore = 0
    @ResetBall()
    @ResetPaddles()
    @gameOver = false
    @UpdateScoreDisplay()
    return

  InitResetTimer: =>
    @resetTimer = 5
    return

  CheckWin: =>
    if @playerScore == 10
      @PlayerWin()
    else if @enemyScore == 10
      @PlayerLose()
    return

  PlayerWin: =>
    @UpdateWinDisplay('NICE')
    @gameOver = true
    @InitResetTimer()

    return

  PlayerLose: =>
    @UpdateWinDisplay('FAIL')
    @gameOver = true
    @InitResetTimer()

    return
