class @HeartVisualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @visualizerElement = $('#visualizer')
    @timer = 0

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    #@directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    #@directionalLight.position.set(0, 1, 1)
    #@scene.add(@directionalLight)

    #@ambientLight = new THREE.AmbientLight(0xffffff)
    #@scene.add(@ambientLight)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10, 20, 20)
    @scene.add(@pointLight)

    @renderer = new THREE.WebGLRenderer
    @renderer.setClearColor(0x07020a)
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    @Heart()

    @camera.position.z = 20
    return

  Heart: ->
    heartMaterial = new THREE.MeshPhongMaterial({color: 0xff00000})
    loader = new THREE.OBJLoader

    loader.load 'models/heart.obj', (object) =>
      object.traverse (child) ->
        if (child instanceof THREE.Mesh)
          child.material = heartMaterial

      @heart = object
      @scene.add(object)
    return

  Render: =>
    requestAnimationFrame(@Render)

    @timer += 0.01

    @heart.rotation.y = @timer if @heart?

    @renderer.render(@scene, @camera)
    return

  OnResize: =>
    renderW = window.innerWidth
    renderH = window.innerHeight

    @camera.aspect = renderW / renderH
    @camera.updateProjectionMatrix()

    @renderer.setSize renderW, renderH
    @renderer.domElement.width = renderW
    @renderer.domElement.height = renderH
    return
