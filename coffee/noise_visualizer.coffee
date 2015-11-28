class @NoiseVisualizer
  constructor: ->
    @scene = new THREE.Scene
    @camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000)

    @noiseAmount = 1.0

    return

  Update: ->
    return
