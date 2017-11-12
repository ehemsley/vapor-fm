const THREE = require('three')
const Visualizer = require('js/visualizer')
const MystifyQuadrilateral = require('js/mystify_quadrilateral')

module.exports = class MystifyVisualizer extends Visualizer {
  constructor (audioInitializer) {
    super(
      audioInitializer,
      { strength: 10, strengthIncrease: 0.0, kernelSize: 6, sigma: 1.1, resolution: 512 },
      0.0,
      2.0,
      true
    )

    this.Update = this.Update.bind(this)

    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      1000)

    this.quadrilateralOne = this.Quadrilateral()
    this.quadrilateralTwo = this.Quadrilateral()

    for (var quadrilateral of Array.from(this.quadrilateralOne.quadrilaterals)) {
      this.scene.add(quadrilateral.line)
    }

    for (quadrilateral of Array.from(this.quadrilateralTwo.quadrilaterals)) {
      this.scene.add(quadrilateral.line)
    }

    this.skyBox = this.SkyBox()
    this.scene.add(this.skyBox)

    this.camera.position.z = 6
  }

  Quadrilateral () {
    return new MystifyQuadrilateral(window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2)
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(window.innerWidth, window.innerHeight, 500)
    const material = new THREE.MeshBasicMaterial({color: 0x000003, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  Update (deltaTime) {
    if (deltaTime != null) {
      this.quadrilateralOne.Update(deltaTime)
      this.quadrilateralTwo.Update(deltaTime)

      let previousMax = 0
      let quadCounter = 0
      const increment = Math.floor(this.audioInitializer.beatdetect.detectSize() / 5)
      for (let newMax = 0, end = this.audioInitializer.beatdetect.detectSize(), step = increment, asc = step > 0; asc ? newMax <= end : newMax >= end; newMax += step) {
        if (this.audioInitializer.beatdetect.isRange(previousMax, newMax, 4)) {
          this.quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity = 1.0
          this.quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity = 1.0
        } else {
          let currentOpacity = this.quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity
          this.quadrilateralOne.quadrilaterals[quadCounter].line.material.opacity = Math.max(currentOpacity - 0.01, 0.3)
          currentOpacity = this.quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity
          this.quadrilateralTwo.quadrilaterals[quadCounter].line.material.opacity = Math.max(currentOpacity - 0.01, 0.3)
        }

        this.quadrilateralOne.quadrilaterals[quadCounter].line.material.needsUpdate = true
        this.quadrilateralTwo.quadrilaterals[quadCounter].line.material.needsUpdate = true
        quadCounter += 1
        previousMax = newMax
      }
    }
  }
}
