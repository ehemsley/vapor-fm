Visualizer = require('coffee/visualizer')
MystifyQuadrilateral = require('coffee/mystify_quadrilateral')

module.exports = class MystifyVisualizer extends Visualizer
  constructor: (audioInitializer) ->
    super(audioInitializer,
          { strength: 10, strengthIncrease: 0.0, kernelSize: 6, sigma: 1.1, resolution: 512 },
          0.0,
          2.0,
          true)

    @camera = new THREE.OrthographicCamera(window.innerWidth / -2,
                                           window.innerWidth / 2,
                                           window.innerHeight / 2,
                                           window.innerHeight / -2,
                                           0.1,
                                           1000)

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
    material = new THREE.MeshBasicMaterial({color: 0x000003, side: THREE.BackSide})
    skybox = new THREE.Mesh(geometry, material)
    skybox

  Update: (deltaTime) =>
    if deltaTime?
      @quadrilateralOne.Update(deltaTime)
      @quadrilateralTwo.Update(deltaTime)

      previousMax = 0
      quadCounter = 0
      increment = Math.floor(@audioInitializer.beatdetect.detectSize() / 5)
      for newMax in [0..@audioInitializer.beatdetect.detectSize()] by increment
        if @audioInitializer.beatdetect.isRange(previousMax, newMax, 4)
          @quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity = 1.0
          @quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity = 1.0
        else
          currentOpacity = @quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity
          @quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity = Math.max(currentOpacity - 0.01, 0.3)
          currentOpacity = @quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity
          @quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity = Math.max(currentOpacity - 0.01, 0.3)

        @quadrilateralOne.quadrilaterals[quadCounter].line.material.needsUpdate = true
        @quadrilateralTwo.quadrilaterals[quadCounter].line.material.needsUpdate = true
        quadCounter += 1
        previousMax = newMax

    return
