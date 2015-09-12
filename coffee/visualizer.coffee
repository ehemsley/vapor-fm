class @Visualizer
  constructor: (audioInitializer) ->
    @audioInitializer = audioInitializer

    @visualizerElement = $('#visualizer')
    @timer = 0
    @xRotationDirection = 1
    @yRotationDirection = -1

    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @renderer = new THREE.WebGLRenderer
    @renderer.setClearColor(0x07020a)
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    @cube = @Cube()
    @lineBoxes = @LineBoxes()

    @scene.add(@cube)

    i = 0
    while i < @lineBoxes.length
      @scene.add(@lineBoxes[i])
      i++

    @camera.position.z = 5

    @RenderProcess()
    return

  Cube: ->
    geometry = new THREE.BoxGeometry(3, 3, 3)
    material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false})
    cube = new THREE.Mesh(geometry, material)
    cube

  LineBoxes: ->
    lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff})
    lineBoxes = []
    i = 0
    while i < 20
      lineBoxGeometry = new THREE.Geometry
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, 10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, -10, -10))
      lineBoxGeometry.vertices.push(new THREE.Vector3(-20, 10, -10))
      lineBox = new THREE.Line(lineBoxGeometry, lineMaterial)
      lineBoxes[i] = lineBox
      i++
    lineBoxes

  RenderProcess: =>
    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

    renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @cubeComposer = new (THREE.EffectComposer)(@renderer, renderTargetCube)
    renderPass = new (THREE.RenderPass)(@scene, @camera)
    @cubeComposer.addPass renderPass

    renderTargetGlow = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @glowComposer = new (THREE.EffectComposer)(@renderer, renderTargetGlow)

    horizontalBlur = new (THREE.ShaderPass)(THREE.HorizontalBlurShader)
    horizontalBlur.uniforms['h'].value = 2.0 / window.innerWidth
    verticalBlur = new (THREE.ShaderPass)(THREE.VerticalBlurShader)
    verticalBlur.uniforms['v'].value = 2.0 / window.innerHeight

    @glowComposer.addPass renderPass
    @glowComposer.addPass horizontalBlur
    @glowComposer.addPass verticalBlur
    @glowComposer.addPass horizontalBlur
    @glowComposer.addPass verticalBlur

    @blendPass = new (THREE.ShaderPass)(THREE.AdditiveBlendShader)
    @blendPass.uniforms['tBase'].value = @cubeComposer.renderTarget1
    @blendPass.uniforms['tAdd'].value = @glowComposer.renderTarget1
    @blendPass.uniforms['amount'].value = 2.0

    @blendComposer = new (THREE.EffectComposer)(@renderer)
    @blendComposer.addPass @blendPass
    bloomPass = new (THREE.BloomPass)(3, 12, 2.0, 512)
    @blendComposer.addPass bloomPass

    @badTV = new (THREE.ShaderPass)(THREE.BadTVShader)
    @badTV.uniforms['distortion'].value = 1.0
    @badTV.uniforms['distortion2'].value = 1.0
    @badTV.uniforms['speed'].value = 0.1
    @badTV.uniforms['rollSpeed'].value = 0.0
    @blendComposer.addPass @badTV

    @rgbEffect = new (THREE.ShaderPass)(THREE.RGBShiftShader)
    @rgbEffect.uniforms['amount'].value = 0.0015
    @rgbEffect.uniforms['angle'].value = 0
    @blendComposer.addPass @rgbEffect

    film = new (THREE.ShaderPass)(THREE.FilmShader)
    film.uniforms['sCount'].value = 800
    film.uniforms['sIntensity'].value = 0.9
    film.uniforms['nIntensity'].value = 0.4
    film.uniforms['grayscale'].value = 0
    @blendComposer.addPass film

    vignette = new (THREE.ShaderPass)(THREE.VignetteShader)
    vignette.uniforms['darkness'].value = 1
    vignette.uniforms['offset'].value = 1.1
    vignette.renderToScreen = true
    @blendComposer.addPass vignette
    return

  Render: =>
    requestAnimationFrame(@Render)

    @timer += 0.01

    @rgbEffect.uniforms['amount'].value = Math.sin(@timer * 2) * 0.01
    @badTV.uniforms['time'].value = @timer

    @audioInitializer.analyser.getByteFrequencyData(@audioInitializer.frequencyData)
    @audioInitializer.analyser.getFloatTimeDomainData(@audioInitializer.floats)

    rotationAddition = @audioInitializer.GetAverageVolume(@audioInitializer.frequencyData) / 2000

    @cube.rotation.x += (0.01 + rotationAddition) * @xRotationDirection
    @cube.rotation.y += (0.01 + rotationAddition) * @yRotationDirection

    @audioInitializer.beatdetect.detect(@audioInitializer.floats)

    scaleValue = 1.1

    if @audioInitializer.beatdetect.isKick()
      @cube.scale.x = scaleValue
      @cube.scale.y = scaleValue
      @cube.scale.z = scaleValue

      @badTV.uniforms['distortion'].value = 5 * Math.random()
      @badTV.uniforms['distortion2'].value = 5 * Math.random()
      if Math.random() < 0.05
        @badTV.uniforms['rollSpeed'].value = (if Math.random() < 0.5 then -1 else 1) * @audioInitializer.GetAverageVolume(@audioInitializer.frequencyData) / 5000

      @xRotationDirection = if Math.random() < 0.5 then -1 else 1
      @yRotationDirection = if Math.random() < 0.5 then -1 else 1
    else
      @cube.scale.x = Math.max(@cube.scale.x - 0.001, 1)
      @cube.scale.y = Math.max(@cube.scale.y - 0.001, 1)
      @cube.scale.z = Math.max(@cube.scale.z - 0.001, 1)

      @badTV.uniforms['distortion'].value = Math.max(@badTV.uniforms['distortion'].value - 0.1, 1)
      @badTV.uniforms['distortion2'].value = Math.max(@badTV.uniforms['distortion2'].value - 0.1, 1)
      if @badTV.uniforms['rollSpeed'].value > 0
        @badTV.uniforms['rollSpeed'].value = Math.max(@badTV.uniforms['rollSpeed'].value - 0.001, 0)
      else
        @badTV.uniforms['rollSpeed'].value = Math.min(@badTV.uniforms['rollSpeed'].value + 0.001, 0)

    i = 0
    while i < @lineBoxes.length
      @lineBoxes[i].scale.x = ((@timer + (i * 0.5)) * 0.2) % 1.5
      @lineBoxes[i].scale.y = ((@timer + (i * 0.5)) * 0.2) % 1.5
      i++

    @cubeComposer.render(0.1)
    @glowComposer.render(0.1)
    @blendComposer.render(0.1)
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
