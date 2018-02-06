// NOTE: this class should not be instantiated directly

const THREE = require('three')
const Visualizer = require('js/visualizer')

module.exports = class ShaderVisualizer extends Visualizer {
  constructor (audioInitializer, renderer) {
    super(
      audioInitializer,
      { strength: 1.0, strengthIncrease: 0.0, kernelSize: 12.0, sigma: 1.5 },
      0.0,
      2.0,
      true
    )

    this.renderer = renderer
    let aspectRatio = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(90, aspectRatio, 0.5, 200)
    this.camera.position.z = 10
    this.scene.add(this.camera)

    this.time = 0

    let quadUniforms = {
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      time: {
        type: 'f',
        value: this.time
      }
    }

    let vertShader =
    `
      varying vec2 vUv;
      void main()	{
      	vUv = uv;
      	gl_Position = vec4(position.xy, -.041, 1.0);
      }
    `

    this.quadMaterial = new THREE.ShaderMaterial({
      uniforms: quadUniforms,
      vertexShader: vertShader,
      fragmentShader: null,
      depthTest: false
    })

    // full screen quad
    this.quadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2, 1, 1),
      this.quadMaterial
    )

    this.scene.add(this.quadMesh)
  }

  LoadResource (url, callback) {
    let request = new XMLHttpRequest()
    request.onreadystatechange = () => {
      if (request.status === 200) {
        if (request.readyState === 4) {
          callback(request.responseText)
        }
      }
    }
    request.open('GET', url, true)
    request.send()
  }

  Update (deltaTime) {
    this.time += deltaTime
    this.quadMesh.material.uniforms.time.value = this.time
  }

  Resize (renderW, renderH) {
    super.Resize(renderW, renderH)
  }
}
