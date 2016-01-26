Visualizer = require('coffee/visualizer')

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

    @waterBox = @WaterBox()
    @scene.add(@waterBox)

    @jumping = false
    @Dolphin()
    @jumpArc = @DolphinJumpArc()

    @animationTimer = { time: 0 }
    @tween = new TWEEN.Tween(@animationTimer)
    @tween.to({ time: 1 }, 5000)
    @tween.easing(TWEEN.Easing.Sinusoidal.InOut)
    @tween.repeat(Infinity)
    @tween.start()

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x1100aa, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  WaterBox: =>
    geometry = new THREE.BoxGeometry(500, 500, 10)
    waterNormals = new THREE.ImageUtils.loadTexture('vendor/images/waternormals.jpg')
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

    @water = new THREE.Water(@renderer, @camera, @scene, {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: waterNormals,
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
    meshMirror

  Dolphin: ->
    dolphinMaterial = new THREE.MeshPhongMaterial({color: 0x6c6876})
    loader = new THREE.OBJLoader
    loader.load 'models/dolphin.obj', (object) =>
      object.traverse (child) ->
        if (child instanceof THREE.Mesh)
          child.material = dolphinMaterial
      object.scale.set(0.1, 0.1, 0.1)
      object.position.set(0, 2, -20)

      @dolphin = object
      @scene.add(@dolphin)
      @jumping = true

    return

  DolphinJumpArc: ->
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-50, -20, -40),
      new THREE.Vector3(0, 100, -40),
      new THREE.Vector3(50, -20, -40)
    )

  Update: (deltaTime) =>
    if deltaTime?
      @timer += deltaTime
      @water.material.uniforms.time.value += deltaTime

      if (@jumping)
        # dolphinTangent = @jumpArc.getTangent((@timer / 10) % 1.0).normalize()
        # @dolphin.position.copy(@jumpArc.getPoint((@timer / 10) % 1.0))
        dolphinTangent = @jumpArc.getTangent(@animationTimer.time)
        @dolphin.position.copy(@jumpArc.getPoint(@animationTimer.time))

        axis.crossVectors(up, dolphinTangent).normalize()
        radians = Math.acos(up.dot(dolphinTangent))
        @dolphin.quaternion.setFromAxisAngle(axis, radians)
        @dolphin.rotateOnAxis(axis, -Math.PI * 0.5)

    return

  Render: =>
    @water.render()
    return
