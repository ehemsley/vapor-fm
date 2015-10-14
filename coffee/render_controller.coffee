class @RenderController
  constructor: (audioInitializer) ->
    @visualizerElement = $('#visualizer')
    @audioInitializer = audioInitializer

    @timer = 0
    @frameCount = 0

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

    @hud = new THREE.Scene()
    # @hudCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    @hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerWidth / 2, -2, 1000)

    @ambientLights = new THREE.AmbientLight(0x404040)
    @hud.add(@ambientLights)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10, 20, 20)
    @hud.add(@pointLight)

    @canvas1 = document.createElement('canvas')
    @canvas1.width = window.innerWidth
    @canvas1.height = window.innerHeight
    @context1 = @canvas1.getContext('2d')
    @context1.font = "60px TelegramaRaw"
    @context1.textAlign = "left"
    @context1.fillStyle = "rgba(255,255,255,0.95)"
    @context1.fillText('Loading...', 0, 60)

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true
    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide })
    @material1.transparent = true
    @mesh1 = new THREE.Mesh(new THREE.PlaneBufferGeometry(@canvas1.width, @canvas1.height), @material1)
    @mesh1.position.set(10,-window.innerHeight,0)
    @hud.add(@mesh1)

    @canvas2 = document.createElement('canvas')
    @canvas2.width = window.innerWidth
    @canvas2.height = window.innerHeight
    @context2 = @canvas2.getContext('2d')
    @context2.font = '60px TelegramaRaw'
    @context2.textAlign = "left"
    @context2.fillStyle = 'rgba(255,255,255,0.95)'
    @context2.fillText('', 0, 60)

    @texture2 = new THREE.Texture(@canvas2)
    @texture2.minFilter = THREE.LinearFilter
    @texture2.magFilter = THREE.LinearFilter
    @texture2.needsUpdate = true
    @material2 = new THREE.MeshBasicMaterial({map: @texture2, side: THREE.DoubleSide })
    @material2.transparent = true
    @mesh2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(@canvas2.width, @canvas2.height), @material2)
    @mesh2.position.set(10,-window.innerHeight * 1.2,0)
    @hud.add(@mesh2)

    @hudCamera.position.set(0,0,0)

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
    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true }

    renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @cubeComposer = new (THREE.EffectComposer)(@renderer, renderTargetCube)
    renderPass = new (THREE.RenderPass)(scene, camera)
    hudPass = new (THREE.RenderPass)(@hud, @hudCamera)

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

    renderTargetBlend = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)

    @blendComposer = new (THREE.EffectComposer)(@renderer, renderTargetBlend)
    @blendComposer.addPass @blendPass
    bloomPass = new (THREE.BloomPass)(3, 12, 2.0, 512)
    @blendComposer.addPass bloomPass

    @badTV = new (THREE.ShaderPass)(THREE.BadTVShader)
    @badTV.uniforms['distortion'].value = 1.0
    @badTV.uniforms['distortion2'].value = 1.0
    @badTV.uniforms['speed'].value = 0.1
    @badTV.uniforms['rollSpeed'].value = 0.0
    @blendComposer.addPass @badTV

    # @rgbEffect = new (THREE.ShaderPass)(THREE.RGBShiftShader)
    # @rgbEffect.uniforms['amount'].value = 0.0015
    # @rgbEffect.uniforms['angle'].value = 0
    # @blendComposer.addPass @rgbEffect

    @fade = new THREE.ShaderPass(THREE.FadeToBlackShader)
    @fade.uniforms['fade'].value = @fadeValue
    @blendComposer.addPass @fade

    renderTargetHud = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @hudComposer = new (THREE.EffectComposer)(@renderer, renderTargetHud)
    @hudComposer.addPass hudPass

    @overlayComposer = new (THREE.EffectComposer)(@renderer)
    @hudBlendPass = new (THREE.ShaderPass)(THREE.AdditiveBlendShader)
    @hudBlendPass.uniforms['tBase'].value = @blendComposer.renderTarget1
    @hudBlendPass.uniforms['tAdd'].value = @hudComposer.renderTarget2
    @hudBlendPass.uniforms['amount'].value = 1.0

    @overlayComposer.addPass @hudBlendPass

    @crtEffect = new THREE.ShaderPass(THREE.CRTShader)
    @crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
    @crtEffect.renderToScreen = true
    @overlayComposer.addPass @crtEffect
    return

  Render: =>
    requestAnimationFrame(@Render)

    @timer += 0.01

    @frameCount += 1

    @FadeOut() if @fadingOut
    @FadeIn() if @fadingIn

    @UpdateText() if @frameCount % 120 == 0
    @UpdateAudioAnalyzer()
    @UpdateEffects()
    @activeVisualizer.Update()

    @cubeComposer.render(0.1)
    @glowComposer.render(0.1)
    @blendComposer.render(0.1)
    @hudComposer.render(0.1)
    @overlayComposer.render(0.1)

    return

  OnResize: =>
    renderW = window.innerWidth
    renderH = window.innerHeight

    for visualizer in @visualizers
      visualizer.camera.aspect = renderW / renderH
      visualizer.camera.updateProjectionMatrix()

    @crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)

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
        @badTV.uniforms['distortion'].value = Math.max(@badTV.uniforms['distortion'].value - 0.1, 0.001)
        @badTV.uniforms['distortion2'].value = Math.max(@badTV.uniforms['distortion2'].value - 0.1, 0.001)
        if @badTV.uniforms['rollSpeed'].value > 0
          @badTV.uniforms['rollSpeed'].value = Math.max(@badTV.uniforms['rollSpeed'].value - 0.001, 0)
        else
          @badTV.uniforms['rollSpeed'].value = Math.min(@badTV.uniforms['rollSpeed'].value + 0.001, 0)

    return

  UpdateText: =>
    songData = document.getElementById('title').innerHTML
    if (@CountOccurrences(songData, ' - ') < 1)
      artistName = 'N/A'
      songName = 'N/A'
    else if (@CountOccurrences(songData, ' - ') == 1)
      artistName = songData.split(' - ')[0]
      songName = songData.split(' - ')[1]
    else
      artistSubStringLocation = @GetNthOccurrence(songData, ' - ', 1)
      songSubStringLocation = @GetNthOccurrence(songData, ' - ', 2)
      artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation)
      songName = songData.substring(songSubStringLocation + 3, songData.length)

    @context1.clearRect(0, 0, @canvas1.width, @canvas1.height)
    @context1.font = '60px TelegramaRaw'
    @context1.fillText(artistName, 0, 60)
    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    @context2.clearRect(0, 0, @canvas2.width, @canvas2.height)
    @context2.font = '60px TelegramaRaw'
    @context2.fillText(songName, 0, 60)
    @mesh2.material.map.needsUpdate = true
    @mesh2.material.needsUpdate = true

    return

  GetNthOccurrence: (str, m, i) ->
    return str.split(m, i).join(m).length

  CountOccurrences: (str, value) ->
    regExp = new RegExp(value, "gi")
    return (str.match(regExp) || []).length
