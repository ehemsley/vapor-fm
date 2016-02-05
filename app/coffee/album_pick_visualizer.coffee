Visualizer = require('coffee/visualizer')

module.exports = class AlbumPickVisualizer extends Visualizer
  constructor: (audioInitializer) ->
    super(audioInitializer,
          { strength: 1, strengthIncrease: 0, kernelSize: 12, sigma: 1.5, resolution: 512 },
          0.2,
          0.0,
          false)

    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @InitializeCanvas()
    @DrawHeaderText()

    @textFlashing = false
    @flashingTextOn = false

    @albumDisplayTimer = 0

    @camera.position.z = 40
    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x4d004d, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  InitializeCanvas: =>
    @canvas1 = document.createElement('canvas')
    @canvas1.width = 540
    @canvas1.height = 180
    @context1 = @canvas1.getContext('2d')
    @context1.font = '30px TelegramaRaw'
    @context1.textBaseline = 'top'
    @context1.fillStyle = 'rgba(255, 255, 255, 0.95)'
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

    return


  DrawHeaderText: =>
    @ClearHeaderText()
    @context1.textAlign = 'center'
    @context1.font = '20px TelegramaRaw'
    @context1.fillText('vapor fm', 280, 0)

    @context1.font = '14px TelegramaRaw'
    @context1.fillText('album pick', 280, 25)
    @context1.fillText('of the month is', 280, 40)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearHeaderText: =>
    @context1.clearRect(0, 0, 540, 60)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawAlbumText: =>
    @ClearAlbumText()
    @context1.textAlign = 'center'
    @context1.font = '14px TelegramaRaw'
    @context1.fillText('SCHELLS / inner monologue', 280, 65)
    @context1.font = '12px TelegramaRaw'
    @context1.fillText('by', 280, 82)
    @context1.fillText('t a c o m a 2 0 0 0 x PART TIME', 280, 100)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  ClearAlbumText: =>
    @context1.clearRect(0, 65, 540, 50)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  DrawCongratulatoryText: =>
    @ClearCongratulatoryText()
    @context1.font = '15px TelegramaRaw'
    @context1.fillText('おめでとうございます', 280, 130)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  ClearCongratulatoryText: =>
    @context1.clearRect(0, 130, 540, 20)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  Activate: =>
    @ClearAlbumText()
    @ClearCongratulatoryText()

    @timer = 0
    @albumDisplayTimer = 0

    @textFlashing = false
    @flashingTextOn = false
    return

  Update: (deltaTime) =>
    if deltaTime?
      @albumDisplayTimer += deltaTime
      @timer += deltaTime if @textFlashing

    @DrawHeaderText()

    if @albumDisplayTimer > 3
      @DrawAlbumText()
      @textFlashing = true

    if @textFlashing
      if @flashingTextOn
        if @timer > 1
          @ClearCongratulatoryText()
          @flashingTextOn = false
          @timer = 0
      else
        if @timer > 1
          @DrawCongratulatoryText()
          @flashingTextOn = true
          @timer = 0

    return
