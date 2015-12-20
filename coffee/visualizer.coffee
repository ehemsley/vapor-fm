class @Visualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @timer = 0
    @xRotationDirection = 1
    @yRotationDirection = -1

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @bloomParams = { strength: 1.0, strengthIncrease: 0, kernelSize: 12.0, sigma: 1.5, resolution: 512 }
    @noiseAmount = 0.0

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10, 20, 20)
    @scene.add(@pointLight)

    @skyBox = @SkyBox()
    @cube = @Cube()
    @lineBoxes = @LineBoxes()

    @scene.add(@skyBox)
    # @scene.add(@cube)

    @RomanBust()

    i = 0
    while i < @lineBoxes.length
      @scene.add(@lineBoxes[i])
      i++

    @beatDistortionEffect = true

    @camera.position.z = 6
    return

  Cube: ->
    geometry = new THREE.BoxGeometry(3, 3, 3)
    material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false})
    cube = new THREE.Mesh(geometry, material)
    cube

  RomanBust: ->
    @bustMinScale = 0.14
    bustMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
    loader = new THREE.OBJLoader
    loader.load 'models/romanbust.obj', (object) =>
      object.traverse (child) ->
        if (child instanceof THREE.Mesh)
          child.material = bustMaterial
      object.scale.set(@bustMinScale, @bustMinScale, @bustMinScale)
      object.position.set(0, -3.5, 0)

      @bust = object
      @scene.add(@bust)

  LineBoxes: ->
    lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2})
    lineBoxes = []
    i = 0
    while i < 20
      lineBoxGeometry = new THREE.Geometry
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      lineBox = new THREE.Line(lineBoxGeometry, lineMaterial)
      lineBoxes[i] = lineBox
      i++
    lineBoxes

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x1100ff, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  Update: (deltaTime) =>
    @timer += 0.01

    rotationAddition = @audioInitializer.GetAverageVolume(@audioInitializer.frequencyData) / 2000

    if @bust?
      @bust.rotation.y += (0.01 + rotationAddition) * @yRotationDirection

      scaleValue = 0.142

      if @audioInitializer.beatdetect.isKick()
        @bust.scale.set(scaleValue, scaleValue, scaleValue)
        @yRotationDirection = if Math.random() < 0.5 then -1 else 1
      else
        @bust.scale.x = Math.max(@bust.scale.x - 0.001, @bustMinScale)
        @bust.scale.y = Math.max(@bust.scale.y - 0.001, @bustMinScale)
        @bust.scale.z = Math.max(@bust.scale.z - 0.001, @bustMinScale)

    i = 0
    while i < @lineBoxes.length
      @lineBoxes[i].scale.x = ((@timer + (i * 0.5)) * 0.2) % 1.5
      @lineBoxes[i].scale.y = ((@timer + (i * 0.5)) * 0.2) % 1.5
      i++

    return

  HandleKeyDownInput: (keyCode) ->
    return

  HandleKeyUpInput: (keyCode) ->
    return
