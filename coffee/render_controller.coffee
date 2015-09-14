class @RenderController
  constructor: (visualizers) ->
    @visualizerElement = $('#visualizer')

    @renderer = new THREE.WebGLRenderer
    @renderer.setClearColor(0x07020a)
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    @visualizers = visualizers
    @visualizerCounter = 1
    @activeVisualizer = @visualizers[@visualizerCounter]

    @fadingIn = false
    @fadingOut = false
    @fadeValue = 0.0

    @RenderProcess(@activeVisualizer.scene, @activeVisualizer.camera)

  FadeToNext: =>
    @fadingOut = true

  FadeOut: =>
    if @fadeValue == 1.0
      @fadingOut = false
      @NextVisualizer()
      @fadingIn = true
    else
      @fadeValue = Math.min(@fadeValue + 0.01, 1.0)
    @fade.uniforms['fade'].value = @fadeValue

  FadeIn: =>
    if @fadeValue == 0.0
      @fadingIn = false
    else
      @fadeValue = Math.max(@fadeValue - 0.01, 0.0)
    @fade.uniforms['fade'].value = @fadeValue

  NextVisualizer: =>
    @visualizerCounter = (@visualizerCounter + 1) % @visualizers.length
    @activeVisualizer = @visualizers[@visualizerCounter]

    @RenderProcess(@activeVisualizer.scene, @activeVisualizer.camera)

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
    @blendComposer.addPass vignette

    @fade = new THREE.ShaderPass(THREE.FadeToBlackShader)
    @fade.uniforms['fade'].value = @fadeValue
    @fade.renderToScreen = true
    @blendComposer.addPass @fade
    return

  Render: =>
    requestAnimationFrame(@Render)

    @FadeOut() if @fadingOut
    @FadeIn() if @fadingIn

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
