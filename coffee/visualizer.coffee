class @Visualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @timer = 0
    @xRotationDirection = 1
    @yRotationDirection = -1

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @cube = @Cube()
    @lineBoxes = @LineBoxes()

    @scene.add(@cube)

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

  LineBoxes: ->
    lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff})
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

  Update: =>
    @timer += 0.01

    rotationAddition = @audioInitializer.GetAverageVolume(@audioInitializer.frequencyData) / 2000

    @cube.rotation.x += (0.01 + rotationAddition) * @xRotationDirection
    @cube.rotation.y += (0.01 + rotationAddition) * @yRotationDirection

    scaleValue = 1.1

    if @audioInitializer.beatdetect.isKick()
      @cube.scale.x = scaleValue
      @cube.scale.y = scaleValue
      @cube.scale.z = scaleValue

      @xRotationDirection = if Math.random() < 0.5 then -1 else 1
      @yRotationDirection = if Math.random() < 0.5 then -1 else 1
    else
      @cube.scale.x = Math.max(@cube.scale.x - 0.001, 1)
      @cube.scale.y = Math.max(@cube.scale.y - 0.001, 1)
      @cube.scale.z = Math.max(@cube.scale.z - 0.001, 1)

    i = 0
    while i < @lineBoxes.length
      @lineBoxes[i].scale.x = ((@timer + (i * 0.5)) * 0.2) % 1.5
      @lineBoxes[i].scale.y = ((@timer + (i * 0.5)) * 0.2) % 1.5
      i++

    return


