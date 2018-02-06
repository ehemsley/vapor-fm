const ShaderVisualizer = require('js/visualizers/shader_visualizer')

module.exports = class CheckerboardVisualizer extends ShaderVisualizer {
  constructor (audioInitializer, renderer) {
    super(audioInitializer, renderer)

    super.LoadResource('shaders/checkerboard.glsl', (responseText) => {
      this.quadMesh.material.fragmentShader = responseText
      // this.quadMesh.material.map.needsUpdate = true
      this.quadMesh.material.needsUpdate = true
    })
  }
}
