module.exports = class StartScreen
  constructor: ->
    @timer = 0

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @no_glow = true
    @scene.background = new THREE.Color(0x3E1C33)
    #@clearColor = 0xa4d5f5
    #@clearOpacity = 0

    @bloomParams = { strength: 1.0, strengthIncrease: 0, kernelSize: 5.0, sigma: 1.0, resolution: 512 }
    @noiseAmount = 0.0
    @blendStrength = 1.0

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    #@skyBox = @SkyBox()
    #@scene.add(@skyBox)

    #@renderer.setClearColor(0xa4d5f5);

    @InitializeCanvas()
    @DrawHeaderLogo()
    #@DrawHeaderText()
    # @DrawTestRect()

    @textFlashing = true
    @flashingTextOn = false
    @firstFrame = false

    @showChannelNum = false
    @showCornerLogo = false

    @camera.position.z = 300
    return

  InitializeCanvas: =>
    @canvas1 = document.createElement('canvas')
    @canvas1.width = 600
    @canvas1.height = 600
    @context1 = @canvas1.getContext('2d')
    @context1.font = "40px DolphinOceanWave"
    @context1.fillText('blah blah blah', -200, -200) #hack to pre-initialize font

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
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), @material1)
    @mesh1.position.set(0, -150, 0)
    @scene.add(@mesh1)

  DrawTestRect: =>
    @context1.fillRect(0, 0, 540, 180)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawHeaderLogo: =>
    img = document.getElementById("logo_header")

    onImageLoad = =>
      @context1.drawImage(img, 0, 0)

    if (img.complete)
      onImageLoad(img)
    else
      img.onload = onImageLoad


    #img = document.getElementById("logo")
    #@context1.drawImage(img, 0, 0)

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
                       280, 60)
    @context1.fillText('Volume: ' + String.fromCharCode(8593) + ' or ' + String.fromCharCode(8595),
                       280, 80)
    @context1.fillText('Pause/Play: Space', 280, 100)
    @context1.fillText('Shuffle Mode: S', 280, 120)
    @context1.fillText('History: Click Bottom Left', 280, 140)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawFlashingText: =>
    @ClearFlashingText()
    @context1.textAlign = 'center'
    @context1.strokeStyle = 'black'
    @context1.strokeText('Press any key to begin', 300, 200)

    @context1.fillText('Press any key to begin', 300, 200)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  DrawLoadingText: =>
    @context1.textAlign = 'center'
    @context1.strokeStyle = 'black'
    @context1.strokeText('Loading', 300, 200)

    @context1.fillText('Loading', 300, 200)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  ClearHeaderText: =>
    @ClearText(0, 0, 540, 158)
    return

  ClearFlashingText: =>
    @ClearText(0, 195, 540, 250)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearText: (left, top, right, bottom) =>
    @context1.clearRect(left, top, right, bottom)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(1000, 1000, 1000)
    material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide})
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

    #@DrawHeaderText()

  Activate: ->
    return

  Render: ->
    return

  HandleKeyDownInput: (keyCode) ->
    return

  HandleKeyUpInput: (keyCode) ->
    return
