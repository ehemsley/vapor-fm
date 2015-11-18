class @MystifyVisualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @timer = 0

    @scene = new THREE.Scene
    # @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    @camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000)

    @quadrilateralOne = @Quadrilateral()
    @quadrilateralTwo = @Quadrilateral()

    for quadrilateral in @quadrilateralOne.quadrilaterals
      @scene.add(quadrilateral.line)

    for quadrilateral in @quadrilateralTwo.quadrilaterals
      @scene.add(quadrilateral.line)

    @skyBox = @SkyBox()
    @scene.add(@skyBox)

    @camera.position.z = 6
    return

  Quadrilateral: ->
    return new MystifyQuadrilateral(window.innerWidth / -2,
                                    window.innerWidth / 2,
                                    window.innerHeight / 2,
                                    window.innerHeight / -2)


  SkyBox: ->
    geometry = new THREE.BoxGeometry(window.innerWidth, window.innerHeight, 500)
    material = new THREE.MeshBasicMaterial({color: 0x5500ff, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  Update: (deltaTime) =>
    if deltaTime?
      @quadrilateralOne.Update(deltaTime)
      @quadrilateralTwo.Update(deltaTime)

    return
