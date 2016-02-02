Visualizer = require('coffee/visualizer')

module.exports = class ShoppingVisualizer extends Visualizer
  constructor: (audioInitializer) ->
    super(audioInitializer,
          { strength: 1.0, strengthIncrease: 0.0, kernelSize: 12.0, sigma: 1.5, resolution: 512 },
          0.0,
          true)

    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    @camera.position.set(0, 5, 10)
    @camera.lookAt(new THREE.Vector3(0,0,0))

    @ambientLight = new THREE.AmbientLight( 0x040404 )
    @scene.add(@ambientLight)

    @pointLight = new THREE.PointLight( 0xffaaff, 0.8, 100)
    @pointLight.position.set(0,20,0)
    @scene.add(@pointLight)

    @spotLight = new THREE.SpotLight( 0xffffff, 0.2 )
    @spotLight.position.set(0, 30, 10)
    @spotLight.castShadow = true
    @spotLight.shadowMapWidth = 512
    @spotLight.shadowMapHeight = 512

    @spotLight.shadowCameraNear = 500
    @spotLight.shadowCameraFar = 4000
    @spotLight.shadowCameraFov = 75

    @scene.add(@spotLight)

    @floor = @Floor()
    @scene.add(@floor)

    @box = @Box()
    @scene.add(@box)

    return

  Floor: ->
    geometry = new THREE.PlaneBufferGeometry(512, 512)
    material = new THREE.MeshPhongMaterial( { color: 0xdddddd })
    floor = new THREE.Mesh(geometry, material)
    floor.rotation.x = -Math.PI * 0.5
    floor


  Box: ->
    geometry = new THREE.BoxGeometry(1, 5, 2)
    material = new THREE.MeshPhongMaterial( { color: 0xdddddd })
    box = new THREE.Mesh(geometry, material)
    box

  Update: (deltaTime) ->
    @box.rotation.y += 2 * deltaTime
