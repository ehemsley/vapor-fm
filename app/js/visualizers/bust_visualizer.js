const THREE = require('three')
const Visualizer = require('js/visualizer')

module.exports = class BustVisualizer extends Visualizer {
  constructor (audioInitializer) {
    super(
      audioInitializer,
      { strength: 1.0, strengthIncrease: 0, kernelSize: 12.0, sigma: 1.5, resolution: 512 },
      0.0,
      2.0,
      true
    )

    this.Update = this.Update.bind(this)

    this.glow = false
    this.xRotationDirection = 1
    this.yRotationDirection = -1

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(this.ambientLight)

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100)
    this.pointLight.position.set(10, 20, 20)
    this.scene.add(this.pointLight)

    this.skyBox = this.SkyBox()
    this.cube = this.Cube()
    this.lineBoxes = this.LineBoxes()

    this.scene.add(this.skyBox)

    this.scaleValue = 0.142
    this.RomanBust()

    let i = 0
    while (i < this.lineBoxes.length) {
      this.scene.add(this.lineBoxes[i])
      i++
    }

    this.camera.position.z = 6
  }

  Cube () {
    const geometry = new THREE.BoxGeometry(3, 3, 3)
    const material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false})
    const cube = new THREE.Mesh(geometry, material)
    return cube
  }

  RomanBust () {
    this.bustMinScale = 0.14
    const bustMaterial = new THREE.MeshPhongMaterial({color: 0xffffff})
    const loader = new THREE.OBJLoader()
    return loader.load('models/romanbustrecalc.obj', object => {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = bustMaterial
        }
      })
      object.scale.set(this.bustMinScale, this.bustMinScale, this.bustMinScale)
      object.position.set(0, -3.5, 0)

      this.bust = object
      return this.scene.add(this.bust)
    })
  }

  LineBoxes () {
    const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2})
    const lineBoxes = []
    let i = 0
    while (i < 20) {
      const lineBoxGeometry = new THREE.Geometry()
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      const lineBox = new THREE.Line(lineBoxGeometry, lineMaterial)
      lineBoxes[i] = lineBox
      i++
    }
    return lineBoxes
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(500, 500, 500)
    const material = new THREE.MeshBasicMaterial({color: 0x1100ff, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  Update (deltaTime) {
    this.timer += 0.01

    const rotationAddition = this.audioInitializer.GetAverageVolume(this.audioInitializer.frequencyData) / 2000

    if (this.bust != null) {
      this.bust.rotation.y += (0.01 + rotationAddition) * this.yRotationDirection

      if (this.audioInitializer.beatdetect.isKick()) {
        this.bust.scale.set(this.scaleValue, this.scaleValue, this.scaleValue)
        this.yRotationDirection = Math.random() < 0.5 ? -1 : 1
      } else {
        this.bust.scale.x = Math.max(this.bust.scale.x - 0.001, this.bustMinScale)
        this.bust.scale.y = Math.max(this.bust.scale.y - 0.001, this.bustMinScale)
        this.bust.scale.z = Math.max(this.bust.scale.z - 0.001, this.bustMinScale)
      }
    }

    let i = 0
    while (i < this.lineBoxes.length) {
      this.lineBoxes[i].scale.x = ((this.timer + (i * 0.5)) * 0.2) % 1.5
      this.lineBoxes[i].scale.y = ((this.timer + (i * 0.5)) * 0.2) % 1.5
      i++
    }
  }
}
