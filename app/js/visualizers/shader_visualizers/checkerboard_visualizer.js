const ShaderVisualizer = require('js/visualizers/shader_visualizer')

module.exports = class CheckerboardVisualizer extends ShaderVisualizer {
  constructor (audioInitializer, renderer) {
    super(audioInitializer, renderer)

    console.log('eyyy')
    // load resource here
    super.LoadResource('shaders/checkerboard.glsl', (responseText) => {
      this.quadMesh.material.fragmentShader = responseText
      // this.quadMesh.material.map.needsUpdate = true
      this.quadMesh.material.needsUpdate = true
      console.log(responseText)
    })
  }
}
