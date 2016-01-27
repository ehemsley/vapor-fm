Visualizer = require('coffee/visualizer')
Dolphin = require('coffee/dolphin')

axis = new THREE.Vector3()
up = new THREE.Vector3(0, 1, 0)

module.exports = class OceanVisualizer extends Visualizer
  constructor: (audioInitializer, renderer) ->
    super(audioInitializer,
          { strength: 1.0, strengthIncrease: 0.0, kernelSize: 12.0, sigma: 1.5, resolution: 512 },
          0.0,
          true)

    @renderer = renderer
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    @camera.position.set(0, 5, 6)

    # @ambientLight = new THREE.AmbientLight(0x404040)
    # @scene.add(@ambientLight)

    @directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    @directionalLight.position.set(0, 1, 0)
    @scene.add(@directionalLight)

    @pointLight = new THREE.PointLight(0xffffff, 1, 10000)
    @pointLight.position.set(0, 5, 0)
    @scene.add(@pointLight)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @InitWaterBox()

    @loaded = false
    @InitDolphin()
    @dolphins = []

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x1100aa, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  InitWaterBox: =>
    geometry = new THREE.BoxGeometry(500, 500, 10)
    textureLoader = new THREE.TextureLoader()
    textureLoader.load 'vendor/images/waternormals.jpg', (texture) =>
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping

      @water = new THREE.Water(@renderer, @camera, @scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: texture,
        alpha: 1.0,
        sunDirection: @directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        betaVersion: 0,
        side: THREE.DoubleSide
      })

      meshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(500, 500, 10, 10),
        @water.material
      )

      meshMirror.add(@water)
      meshMirror.rotation.x = -Math.PI * 0.5
      @scene.add(meshMirror)

  InitDolphin: ->
    dolphinMaterial = new THREE.MeshPhongMaterial({color: 0x6c6876})
    loader = new THREE.OBJLoader
    loader.load 'models/dolphin.obj', (object) =>
      object.traverse (child) ->
        if (child instanceof THREE.Mesh)
          child.material = dolphinMaterial
      object.scale.set(0.1, 0.1, 0.1)
      object.position.set(0, 2, -20)

      @dolphin = object
      @loaded = true

    return

  Update: (deltaTime) =>
    if deltaTime?
      @timer += deltaTime
      @water.material.uniforms.time.value += deltaTime

      if @loaded
        @CreateDolphin() if @audioInitializer.beatdetect.isKick()

        for dolphin in @dolphins
          dolphin.Update()

        @CleanDolphins()

    return

  Render: =>
    @water.render()
    return

  CreateDolphin: =>
    dolphin = new Dolphin(@dolphin.clone())
    @dolphins.push(dolphin)
    @scene.add(dolphin.object)
    return

  CleanDolphins: =>
    @dolphins = @dolphins.filter (dolphin) =>
      @scene.remove(dolphin.object) if dolphin.finished
      return !dolphin.finished

    return
