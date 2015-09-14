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

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10, 20, 20)
    @scene.add(@pointLight)

    @renderer = new THREE.WebGLRenderer
    @renderer.setClearColor(0x07020a)
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    @Hearts(80)

    @camera.position.z = 20

    @RenderProcess()
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

  Hearts: (number) ->
    @hearts = []
    heartMaterial = new THREE.MeshPhongMaterial({color: 0xff00000})
    loader = new THREE.OBJLoader
    loader.load 'models/heart.obj', (object) =>
      object.traverse (child) ->
        if (child instanceof THREE.Mesh)
          child.material = heartMaterial

      object.userData = { extraRotation: 0 }
      object.rotation.set(@RandomFloat(0, Math.PI/4), @RandomFloat(0, Math.PI/4), 0)
      object.scale.set(0.25, 0.25, 0.25)

      for i in [0..number]
        newObject = object.clone()
        @hearts.push(newObject)
        @scene.add(newObject)

      @SetHeartsPositions()
    return

  SetHeartsPositions: ->
    positions = []
    for heart in @hearts
      newPosition = new THREE.Vector3(@RandomInt(-40, 40), @RandomInt(-40, 40), @RandomInt(-40, 40))
      overlapping = undefined
      if positions.length == 0 then overlapping = false else overlapping = true

      while overlapping
        newPosition = new THREE.Vector3(@RandomInt(-40, 40), @RandomInt(-40, 40), @RandomInt(-40, 40))
        overlapping = false
        for position in positions
          if newPosition.distanceTo(position) < 8
            overlapping = true

      positions.push(newPosition)
      heart.position.set(newPosition.x, newPosition.y, newPosition.z)

  RenderProcess: =>
    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

    renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @cubeComposer = new (THREE.EffectComposer)(@renderer, renderTargetCube)
    renderPass = new (THREE.RenderPass)(@scene, @camera)
    @cubeComposer.addPass renderPass

    renderTargetGlow = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @glowComposer = new (THREE.EffectComposer)(@renderer, renderTargetGlow)

    horizontalBlur = new (THREE.ShaderPass)(THREE.HorizontalBlurShader)
    horizontalBlur.uniforms['h'].value = 1.0 / window.innerWidth
    verticalBlur = new (THREE.ShaderPass)(THREE.VerticalBlurShader)
    verticalBlur.uniforms['v'].value = 1.0 / window.innerHeight

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

    @audioInitializer.analyser.getByteFrequencyData(@audioInitializer.frequencyData)
    @audioInitializer.analyser.getFloatTimeDomainData(@audioInitializer.floats)

    @audioInitializer.beatdetect.detect(@audioInitializer.floats)

    @heart.rotation.y = @timer if @heart?

    if @hearts?
      for heartObject in @hearts
        if heartObject?
          heartObject.rotation.y += 0.01 + heartObject.userData.extraRotation
          heartObject.rotation.x += heartObject.userData.extraRotation
          heartObject.userData.extraRotation = Math.max(0, heartObject.userData.extraRotation - 0.01)

      if @audioInitializer.beatdetect.isKick()
        randomHeart = @hearts[@RandomInt(0, @hearts.length)]
        randomHeart.userData.extraRotation = 0.4 if randomHeart?

    @camera.position.set(40 * Math.cos(@timer * 0.5), 0, 40 * Math.sin(@timer * 0.5))
    @camera.lookAt(@scene.position)

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

  RandomFloat: (min, max) ->
    return Math.random() * (max - min) + min

  RandomInt: (min, max) ->
    return Math.floor(Math.random() * (max - min + 1)) + min
