module.exports = class CybergridVisualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @timer = 0

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)

    @bloomParams = { strength: 3, strengthIncrease: 1, kernelSize: 12, sigma: 2.0, resolution: 512 }
    @noiseAmount = 0.1

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10,20,20)
    @scene.add(@pointLight)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @gridLines = @GridLines(-60, -60, 60, 60, 3)
    for line in @gridLines
      @scene.add(line)

    @sun = @Sun()
    @scene.add(@sun)
    @sun.position.set(0, 5, -50)

    @yRotationDirection = 1

    @beatDistortionEffect = true

    @camera.position.y = 5
    @camera.position.z = 20

    return

  SkyBox: ->
    geometry = new THREE.BoxGeometry(500, 500, 500)
    material = new THREE.MeshBasicMaterial({color: 0x040404, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  GridLines: (left_x, bottom_y, right_x, top_y, spacing) =>
    lines = []
    color = new THREE.Color(0xffffff)

    #bottom
    #horizontal lines
    for y in [bottom_y..top_y] by spacing
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(left_x, 0, y))
      lineGeometry.vertices.push(new THREE.Vector3(right_x, 0, y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    #vertical lines
    for x in [left_x..right_x] by spacing
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(x, 0, bottom_y))
      lineGeometry.vertices.push(new THREE.Vector3(x, 0, top_y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)

    #top
    #horizontal lines
    for y in [bottom_y..top_y] by spacing
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(left_x, 10, y))
      lineGeometry.vertices.push(new THREE.Vector3(right_x, 10, y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    #vertical lines
    for x in [left_x..right_x] by spacing
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(x, 10, bottom_y))
      lineGeometry.vertices.push(new THREE.Vector3(x, 10, top_y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)

    lines

  Sun: =>
    geometry = new THREE.CylinderGeometry(0, 5.5, 6, 4, false)
    material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 1.0, transparent: true})
    sun = new THREE.Mesh(geometry, material)
    sun

  Update: (deltaTime) =>
    if deltaTime?
      @timer += deltaTime
      @sun.rotation.y += deltaTime * @yRotationDirection

    for line in @gridLines
      if line.material.opacity > 0.5
        line.material.opacity = Math.max(line.material.opacity - 0.01, 0.5)
        line.material.needsUpdate = true

    if @audioInitializer.beatdetect.isSnare()
      for i in [0..29]
        randomLine = @gridLines[@RandomInt(0, @gridLines.length-1)]
        randomLine.material.opacity = 1.0

        randomLine.material.needsUpdate = true

    if @audioInitializer.beatdetect.isKick()
      @yRotationDirection = if Math.random() < 0.5 then -1 else 1
      @sun.scale.set(1.2, 1.2, 1.2)
    else
      @sun.scale.x = Math.max(@sun.scale.x - 0.01, 1)
      @sun.scale.y = Math.max(@sun.scale.y - 0.01, 1)
      @sun.scale.z = Math.max(@sun.scale.z - 0.01, 1)

    return

  HandleKeyDownInput: (keyCode) ->
    return

  HandleKeyUpInput: (keyCode) ->
    return

  RandomInt: (min, max) ->
    return Math.floor(Math.random() * (max - min + 1)) + min

  Activate: ->
    return
