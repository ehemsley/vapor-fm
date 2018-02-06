const THREE = require('three')
const Visualizer = require('js/visualizer')

module.exports = class NoiseVisualizer extends Visualizer {
  constructor () {
    super()
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      1000)

    this.noiseAmount = 1.0

    this.showChannelNum = true
    this.showCornerLogo = false
  }
}
