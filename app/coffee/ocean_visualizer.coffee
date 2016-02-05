Visualizer = require('coffee/visualizer')
Dolphin = require('coffee/dolphin')

axis = new THREE.Vector3()
up = new THREE.Vector3(0, 1, 0)

module.exports = class OceanVisualizer extends Visualizer
  constructor: (audioInitializer, renderer) ->
    super(audioInitializer,
          { strength: 1.0, strengthIncrease: 0.0, kernelSize: 12.0, sigma: 1.5, resolution: 512 },
          0.0,
          2.0,
          true)

    @renderer = renderer
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    @camera.position.set(0, 5, 6)

    @directionalLight = new THREE.DirectionalLight(0xfdb813, 1.0)
    @directionalLight.position.set(0, 0, 1)
    @scene.add(@directionalLight)

    @pointLight = new THREE.PointLight(0xd3d3d3, 0.6, 200)
    @pointLight.position.set(0, 5, 10)
    @scene.add(@pointLight)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @InitWaterBox()

    @loaded = false
    @InitDolphin()
    @dolphins = []

    @sun = @Sun()

    @skyChangeTimer = 0

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0xfe5b35, side: THREE.BackSide})
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
        waterColor: 0x1100aa,
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

  Sun: =>
    geometry = new THREE.SphereGeometry(100, 32, 32)
    material = new THREE.MeshBasicMaterial({color: 0xfdb813})
    sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(0, 0, -210)
    @scene.add(sphere)
    sphere

  Update: (deltaTime) =>
    if deltaTime?
      @skyChangeTimer += deltaTime
      @water.material.uniforms.time.value += deltaTime

      if @loaded
        for dolphin in @dolphins
          dolphin.Update()

        @CleanDolphins()

        if @audioInitializer.beatdetect.isKick()
          @CreateDolphin()

        if @skyChangeTimer > 10
          if @audioInitializer.beatdetect.isSnare()
            @skyChangeTimer = 0

            newColors = @RandomSkySunColor()
            sunColor = new THREE.Color(newColors.sun)
            skyColor = new THREE.Color(newColors.sky)

            skyboxTween =
              new TWEEN.Tween(@skyBox.material.color)
                .to(skyColor, 1000)
                .start()
                .onUpdate =>
                  @skyBox.material.needsUpdate = true

            sunTween =
              new TWEEN.Tween(@sun.material.color)
                .to(sunColor, 1000)
                .start()
                .onUpdate =>
                  @sun.material.needsUpdate = true

            lightTween =
              new TWEEN.Tween(@directionalLight.color)
                .to(sunColor, 1000)
                .start()



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

  RandomSkySunColor: ->
    @RandomElt([
      {sun: 0xF4B940, sky: 0x2c5264},
      {sun: 0xE9BC55, sky: 0x586784},
      {sun: 0xDB5A6E, sky: 0x071D69},
      {sun: 0xF3F0A1, sky: 0x3C4884},
      {sun: 0xE49D4B, sky: 0xba538a},
      {sun: 0xfdb813, sky: 0xfe5b35},
      {sun: 0xE6A45A, sky: 0x1A2554}
    ])

  RandomElt: (array) ->
    array[Math.floor(Math.random() * array.length)]
