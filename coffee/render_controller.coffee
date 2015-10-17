class @RenderController
  constructor: (audioInitializer) ->
    @visualizerElement = $('#visualizer')
    @audioInitializer = audioInitializer

    @clock = new THREE.Clock
    @clock.start()
    @timer = 0
    @lastIcecastUpdateTime = @clock.getElapsedTime()
    @lastVolumeUpdatetime = @clock.getElapsedTime()
    @lastVisualizerChangeTime = @clock.getElapsedTime()

    @renderer = new THREE.WebGLRenderer( {alpha: true });
    @renderer.setClearColor(0x000000, 0)
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
    @hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000)

    @ambientLights = new THREE.AmbientLight(0x404040)
    @hud.add(@ambientLights)

    @pointLight = new THREE.PointLight(0xffffff, 1, 100)
    @pointLight.position.set(10, 20, 20)
    @hud.add(@pointLight)

    @canvas1 = document.createElement('canvas')
    @canvas1.width = window.innerWidth
    @canvas1.height = window.innerHeight
    @context1 = @canvas1.getContext('2d')
    @context1.font = "50px TelegramaRaw"
    @context1.textAlign = "left"
    @context1.textBaseline = "top"
    @context1.fillStyle = "rgba(255,255,255,0.95)"
    @context1.fillText('Loading...', 10, @canvas1.height * 0.9 - 50)

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true
    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(@canvas1.width, @canvas1.height), @material1)
    # @mesh1.position.set(10,-window.innerHeight,0)
    @mesh1.position.set(0, 0, 0)
    @hud.add(@mesh1)

    @hudCamera.position.set(0,0,2)

    @GetIcecastData()

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
    @hudBlendPass = new (THREE.ShaderPass)(THREE.DestOverlayBlendShader)
    @hudBlendPass.uniforms['tSource'].value = @blendComposer.renderTarget1
    @hudBlendPass.uniforms['tDest'].value = @hudComposer.renderTarget2

    @overlayComposer.addPass @hudBlendPass

    @badTV = new (THREE.ShaderPass)(THREE.BadTVShader)
    @badTV.uniforms['distortion'].value = 0.001
    @badTV.uniforms['distortion2'].value = 0.001
    @badTV.uniforms['speed'].value = 0.1
    @badTV.uniforms['rollSpeed'].value = 0.0
    @overlayComposer.addPass @badTV

    @crtEffect = new THREE.ShaderPass(THREE.CRTShader)
    @crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
    @crtEffect.renderToScreen = true
    @overlayComposer.addPass @crtEffect
    return

  Render: =>
    requestAnimationFrame(@Render)

    @timer += @clock.getDelta()

    if @clock.getElapsedTime() > @lastIcecastUpdateTime + 5
      @GetIcecastData()
      @lastIcecastUpdateTime = @clock.getElapsedTime()

    if @clock.getElapsedTime() > @lastVolumeUpdateTime + 2
      @ClearVolumeDisplay()

    if @clock.getElapsedTime() > @lastVisualizerChangeTime + 60
      @FadeToNext()
      @lastVisualizerChangeTime = @clock.getElapsedTime()

    @FadeOut() if @fadingOut
    @FadeIn() if @fadingIn

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

  UpdateText: (songData) =>
    #still broken if song has dash in it but not multiple artsts
    # maybe check for duplication of artist name instead and base it on that
    if (@CountOccurrences(songData, ' - ') < 1)
      @artistName = 'N/A'
      @songName = 'N/A'
    else if (@CountOccurrences(songData, ' - ') == 1)
      @artistName = songData.split(' - ')[0]
      @songName = songData.split(' - ')[1]
    else
      artistSubStringLocation = @GetNthOccurrence(songData, ' - ', 1)
      songSubStringLocation = @GetNthOccurrence(songData, ' - ', 2)
      @artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation)
      @songName = songData.substring(songSubStringLocation + 3, songData.length)

    @UpdateOverlay()
    return

  UpdateOverlay: =>
    @context1.clearRect(0, @canvas1.height / 2, @canvas1.width, @canvas1.height / 2)
    @context1.font = '50px TelegramaRaw'
    @context1.fillStyle = 'white'
    @context1.fillText(@artistName, 10, @canvas1.height * 0.9 - 50)
    @context1.fillText(@songName, 10, @canvas1.height * 0.98 - 50)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearVolumeDisplay: =>
    @context1.clearRect(0, 0, @canvas1.width, @canvas1.height / 2)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  UpdateVolumeDisplay: (filledBarAmount) =>
    @ClearVolumeDisplay()

    filledBarAmount = Math.min(Math.round(filledBarAmount), 10)

    rectangleStartX = 10
    rectangleStartY = 70

    volumeBarWidth = Math.round(@canvas1.width * 0.02)
    volumeBarHeight = Math.round(@canvas1.height * 0.1)

    xOffset = 0

    @context1.font = '60px TelegramaRaw'
    @context1.fillStyle = 'green'
    @context1.fillText('Volume', 10, 0)

    i = 0
    while i < filledBarAmount
      @context1.fillRect(rectangleStartX + xOffset + i*volumeBarWidth, rectangleStartY, volumeBarWidth, volumeBarHeight)
      xOffset += volumeBarWidth * 0.5
      i += 1

    i = filledBarAmount
    while i < 10
      @context1.fillRect(rectangleStartX + xOffset + i*volumeBarWidth, rectangleStartY + volumeBarHeight * 0.5 - volumeBarHeight * 0.1, volumeBarWidth, volumeBarHeight * 0.1)
      xOffset += volumeBarWidth * 0.5
      i += 1

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    @lastVolumeUpdateTime = @clock.getElapsedTime()

    return

  GetIcecastData: =>
    $.ajax({
      url: 'http://vapor.fm:8000/status-json.xsl',
      type: 'GET',
      success: (data) =>
        @UpdateText(data.icestats.source.title)
      failure: (status) ->
        console.log('status: ' + status)
      dataType: 'json',
      timeout: 2000
    })
    return

  GetNthOccurrence: (str, m, i) ->
    return str.split(m, i).join(m).length

  CountOccurrences: (str, value) ->
    regExp = new RegExp(value, "gi")
    return (str.match(regExp) || []).length
