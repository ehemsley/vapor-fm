module.exports = class StartScreen
  constructor: ->
    @timer = 0

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @bloomParams = { strength: 1.0, strengthIncrease: 0, kernelSize: 12.0, sigma: 1.5, resolution: 512 }
    @noiseAmount = 0.0

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @InitializeCanvas()
    @DrawHeaderText()
    # @DrawTestRect()

    @textFlashing = true
    @flashingTextOn = false
    @firstFrame = false

    @camera.position.z = 40
    return

  InitializeCanvas: =>
    @canvas1 = document.createElement('canvas')
    @canvas1.width = 540
    @canvas1.height = 180
    @context1 = @canvas1.getContext('2d')
    @context1.font = "30px TelegramaRaw"
    # @context1.textAlign = "left"
    @context1.textBaseline = "top"
    @context1.fillStyle = "rgba(255,255,255,0.95)"
    @context1.strokeStyle = 'white'
    @context1.lineWidth = 2

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true
    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(180, 60), @material1)
    @mesh1.position.set(-4, 0, 0)
    @scene.add(@mesh1)

  DrawTestRect: =>
    @context1.fillRect(0, 0, 540, 180)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawHeaderText: =>
    @ClearHeaderText()
    @context1.textAlign = 'center'
    @context1.font = '30px TelegramaRaw'
    @context1.fillText('vapor.fm', 280, 0)
    @context1.font = '20px TelegramaRaw'
    @context1.fillText('evan hemsley', 280, 35)

    @context1.font = '14px TelegramaRaw'
    @context1.fillText('Channel: ' + String.fromCharCode(8592) + ' or ' + String.fromCharCode(8594),
                       280, 70)
    @context1.fillText('Volume: ' + String.fromCharCode(8593) + ' or ' + String.fromCharCode(8595),
                       280, 90)
    @context1.fillText('Pause/Play: Space', 280, 110)
    @context1.fillText('Shuffle Mode: S', 280, 130)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawFlashingText: =>
    @ClearFlashingText()
    @context1.textAlign = 'center'
    @context1.fillText('Press any key to begin...', 280, 150)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  DrawLoadingText: =>
    @context1.textAlign = 'center'
    @context1.fillText('Loading...', 280, 150)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  ClearHeaderText: =>
    @ClearText(0, 0, 540, 150)
    return

  ClearFlashingText: =>
    @ClearText(0, 150, 540, 180)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearText: (left, top, right, bottom) =>
    @context1.clearRect(left, top, right, bottom)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x1100ff, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  DisplayLoading: =>
    @ClearFlashingText()
    @DrawLoadingText()
    @textFlashing = false

  Update: (deltaTime) =>
    @timer += deltaTime if deltaTime?

    if @textFlashing
      if @flashingTextOn
        if @timer > 1
          @ClearFlashingText()
          @flashingTextOn = false
          @timer = 0
      else
        if @timer > 1
          @DrawFlashingText()
          @flashingTextOn = true
          @timer = 0

    @DrawHeaderText()

  HandleKeyDownInput: (keyCode) ->
    return

  HandleKeyUpInput: (keyCode) ->
    return
