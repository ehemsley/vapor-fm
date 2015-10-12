class @RenderController
  constructor: (audioInitializer) ->
    @visualizerElement = $('#visualizer')
    @audioInitializer = audioInitializer

    @timer = 0

    @renderer = new THREE.WebGLRenderer
    @renderer.setClearColor(0x07020a)
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    @visualizers = [new Visualizer(@audioInitializer), new HeartVisualizer(@audioInitializer)]
    @visualizerCounter = 1
    @activeVisualizer = @visualizers[@visualizerCounter]

    @fadingIn = false
    @fadingOut = false
    @fadeValue = 0.0

    @RenderProcess(@activeVisualizer.scene, @activeVisualizer.camera)

  FadeToNext: =>
    @fadingOut = true
    return

  FadeOut: =>
    if @fadeValue == 1.0
      @fadingOut = false
      @NextVisualizer()
      @fadingIn = true
    else
      @fadeValue = Math.min(@fadeValue + 0.01, 1.0)
    @fade.uniforms['fade'].value = @fadeValue
    return

  FadeIn: =>
    if @fadeValue == 0.0
      @fadingIn = false
    else
      @fadeValue = Math.max(@fadeValue - 0.01, 0.0)
    @fade.uniforms['fade'].value = @fadeValue
    return

  NextVisualizer: =>
    @visualizerCounter = (@visualizerCounter + 1) % @visualizers.length
    @activeVisualizer = @visualizers[@visualizerCounter]

    @RenderProcess(@activeVisualizer.scene, @activeVisualizer.camera)
    return

  RenderProcess: (scene, camera) =>
    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

    renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @cubeComposer = new (THREE.EffectComposer)(@renderer, renderTargetCube)
    renderPass = new (THREE.RenderPass)(scene, camera)
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
    #
    # @rgbEffect = new (THREE.ShaderPass)(THREE.RGBShiftShader)
    # @rgbEffect.uniforms['amount'].value = 0.0015
    # @rgbEffect.uniforms['angle'].value = 0
    # @blendComposer.addPass @rgbEffect

    # film = new (THREE.ShaderPass)(THREE.FilmShader)
    # film.uniforms['sCount'].value = 800
    # film.uniforms['sIntensity'].value = 0.9
    # film.uniforms['nIntensity'].value = 0.4
    # film.uniforms['grayscale'].value = 0
    # @blendComposer.addPass film
    #
    # vignette = new (THREE.ShaderPass)(THREE.VignetteShader)
    # vignette.uniforms['darkness'].value = 0.9
    # vignette.uniforms['offset'].value = 1.1
    # @blendComposer.addPass vignette

    @fade = new THREE.ShaderPass(THREE.FadeToBlackShader)
    @fade.uniforms['fade'].value = @fadeValue
    @blendComposer.addPass @fade

    @crtEffect = new THREE.ShaderPass(THREE.CRTShader)
    @crtEffect.renderToScreen = true
    @blendComposer.addPass @crtEffect
    return

  Render: =>
    requestAnimationFrame(@Render)

    @timer += 0.01

    @FadeOut() if @fadingOut
    @FadeIn() if @fadingIn

    @UpdateAudioAnalyzer()
    @UpdateEffects()
    @activeVisualizer.Update()

    @cubeComposer.render(0.1)
    @glowComposer.render(0.1)
    @blendComposer.render(0.1)

    return

  OnResize: =>
    renderW = window.innerWidth
    renderH = window.innerHeight

    for visualizer in @visualizers
      visualizer.camera.aspect = renderW / renderH
      visualizer.camera.updateProjectionMatrix()

    @renderer.setSize renderW, renderH
    @renderer.domElement.width = renderW
    @renderer.domElement.height = renderH
    return

  UpdateAudioAnalyzer: =>
    @audioInitializer.analyser.getByteFrequencyData(@audioInitializer.frequencyData)
    @audioInitializer.analyser.getFloatTimeDomainData(@audioInitializer.floats)

    @audioInitializer.beatdetect.detect(@audioInitializer.floats)
    return

  UpdateEffects: =>
    # @rgbEffect.uniforms['amount'].value = Math.sin(@timer * 2) * 0.01
    @badTV.uniforms['time'].value = @timer
    @crtEffect.uniforms['time'].value = @timer

    if @activeVisualizer.beatDistortionEffect
      if @audioInitializer.beatdetect.isKick()
        @badTV.uniforms['distortion'].value = 5 * Math.random()
        @badTV.uniforms['distortion2'].value = 5 * Math.random()
        if Math.random() < 0.05
          @badTV.uniforms['rollSpeed'].value = (if Math.random() < 0.5 then -1 else 1) * @audioInitializer.GetAverageVolume(@audioInitializer.frequencyData) / 5000
      else
        @badTV.uniforms['distortion'].value = Math.max(@badTV.uniforms['distortion'].value - 0.1, 1)
        @badTV.uniforms['distortion2'].value = Math.max(@badTV.uniforms['distortion2'].value - 0.1, 1)
        if @badTV.uniforms['rollSpeed'].value > 0
          @badTV.uniforms['rollSpeed'].value = Math.max(@badTV.uniforms['rollSpeed'].value - 0.001, 0)
        else
          @badTV.uniforms['rollSpeed'].value = Math.min(@badTV.uniforms['rollSpeed'].value + 0.001, 0)

    return
