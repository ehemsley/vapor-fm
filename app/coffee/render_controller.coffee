NoiseVisualizer = require('coffee/noise_visualizer')
AlbumPickVisualizer = require('coffee/album_pick_visualizer')
PongVisualizer = require('coffee/pong_visualizer')
BustVisualizer = require('coffee/bust_visualizer')
MystifyVisualizer = require('coffee/mystify_visualizer')
CybergridVisualizer = require('coffee/cybergrid_visualizer')
HeartVisualizer = require('coffee/heart_visualizer')
OceanVisualizer = require('coffee/ocean_visualizer')
StartScreen = require('coffee/start_screen')

NoiseShader = require('shaders/noise_shader')
VHSPauseShader = require('shaders/vhs_pause_shader')
DestOverlayBlendShader = require('shaders/dest_overlay_blend_shader')
CRTShader = require('shaders/crt_shader')

module.exports = class RenderController
  constructor: (audioInitializer) ->
    @visualizerElement = $('#visualizer')
    @audioInitializer = audioInitializer

    @paused = false
    @shuffling = false

    @clock = new THREE.Clock
    @clock.start()
    @timer = 0
    @lastIcecastUpdateTime = @clock.getElapsedTime()
    @lastVolumeUpdatetime = @clock.getElapsedTime()
    @lastInfoUpdateTime = @clock.getElapsedTime()
    @lastChannelUpdateTime = @clock.getElapsedTime()
    @lastPlayStatusToggleTime = 0

    @lastShuffleTime = @clock.getElapsedTime()

    @playStatusTimerRunning = false
    @volumeDisplayActive = false
    @infoDisplayActive = false

    @renderer = new THREE.WebGLRenderer( {alpha: true })
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @visualizerElement.append(@renderer.domElement)

    noiseVisualizer = new NoiseVisualizer()
    @visualizers = (noiseVisualizer for [0..15])
    @visualizers[0] = new PongVisualizer(@audioInitializer)
    @visualizers[1] = new AlbumPickVisualizer(@audioInitializer)
    @visualizers[3] = new BustVisualizer(@audioInitializer)
    @visualizers[4] = new MystifyVisualizer(@audioInitializer)
    @visualizers[5] = new CybergridVisualizer(@audioInitializer)
    @visualizers[7] = new OceanVisualizer(@audioInitializer, @renderer)
    @visualizers[14] = new HeartVisualizer(@audioInitializer)

    @visualizerCounter = 7

    @shuffleIndices = [3, 4, 5, 7, 14]

    @hud = new THREE.Scene()
    @hudCamera = new THREE.OrthographicCamera(
      -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000)

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

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true

    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(@canvas1.width, @canvas1.height), @material1)
    @mesh1.position.set(0, 0, 0)
    @hud.add(@mesh1)

    @hudCamera.position.set(0,0,2)

    @SetVisualizer(new StartScreen())
    @activated = false

    @RenderProcess(@activeVisualizer.scene,
                   @activeVisualizer.camera,
                   @activeVisualizer.bloomParams,
                   @activeVisualizer.noiseAmount,
                   @activeVisualizer.blendStrength)

    # @vhsPause.uniforms['amount'].value = 1.0
    @strengthModifier = 0

  Activate: =>
    @activated = true
    @visualizerCounter = 2
    @NextVisualizer()

    @DrawLogo()

    return

  NextVisualizer: =>
    @visualizerCounter = (@visualizerCounter + 1) % @visualizers.length
    @SetVisualizer(@visualizers[@visualizerCounter])
    if @shuffling
      @shuffling = false
      @DrawShuffleText(@shuffling)
    return

  PreviousVisualizer: =>
    if @visualizerCounter == 0
      @visualizerCounter = @visualizers.length - 1
    else
      @visualizerCounter = @visualizerCounter - 1

    @SetVisualizer(@visualizers[@visualizerCounter])
    if @shuffling
      @shuffling = false
      @DrawShuffleText(@shuffling)
    return

  SetVisualizer: (visualizer) =>
    @activeVisualizer = visualizer
    #@renderer.setClearColor(@activeVisualizer.clearColor, @activeVisualizer.clearOpacity)
    @activeVisualizer.Activate()

    if @activeVisualizer.showChannelNum
      @ShowChannelDisplay(@visualizerCounter)

    @ClearLogo()
    if @activeVisualizer.showCornerLogo
      @DrawLogo()

    @RenderProcess(@activeVisualizer.scene,
                   @activeVisualizer.camera,
                   @activeVisualizer.bloomParams,
                   @activeVisualizer.noiseAmount,
                   @activeVisualizer.blendStrength)

    @badTV.uniforms['rollSpeed'].value = 0.1
    @vhsPause.uniforms['amount'].value = 1.0
    return

  ToggleShuffle: =>
    @shuffling = !@shuffling
    @DrawShuffleText(@shuffling)

    if @shuffling
      @PickRandomVisualizer()
      @lastShuffleTime = @clock.getElapsedTime()
    return

  PickRandomVisualizer: =>
    newVizIndex = @visualizerCounter
    until newVizIndex != @visualizerCounter
      newVizIndex = @shuffleIndices[Math.floor(Math.random() * @shuffleIndices.length)]
    @SetVisualizer(@visualizers[newVizIndex])
    return

  RenderProcess: (scene, camera, bloomParams, noiseAmount, blendStrength) =>
    renderTargetParameters = {
                              minFilter: THREE.LinearFilter,
                              magFilter: THREE.LinearFilter,
                              format: THREE.RGBAFormat,
                              stencilBuffer: true
                             }

    renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @cubeComposer = new (THREE.EffectComposer)(@renderer, renderTargetCube)
    @renderPass = new (THREE.RenderPass)(scene, camera)
    hudPass = new (THREE.RenderPass)(@hud, @hudCamera)

    @cubeComposer.addPass @renderPass
    @blendComposer = new (THREE.EffectComposer)(@renderer, renderTargetBlend)

    renderTargetGlow = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @glowComposer = new (THREE.EffectComposer)(@renderer, renderTargetGlow)

    horizontalBlur = new (THREE.ShaderPass)(THREE.HorizontalBlurShader)
    horizontalBlur.uniforms['h'].value = 1.0 / window.innerWidth
    verticalBlur = new (THREE.ShaderPass)(THREE.VerticalBlurShader)
    verticalBlur.uniforms['v'].value = 1.0 / window.innerHeight

    @blendPass = new (THREE.ShaderPass)(THREE.AdditiveBlendShader)

    @glowComposer.addPass @renderPass
    if !@activeVisualizer.no_glow
      @glowComposer.addPass horizontalBlur
      @glowComposer.addPass verticalBlur
      @glowComposer.addPass horizontalBlur
      @glowComposer.addPass verticalBlur

      @blendPass.uniforms['tBase'].value = @cubeComposer.renderTarget2.texture
      @blendPass.uniforms['tAdd'].value = @glowComposer.renderTarget1.texture
      @blendPass.uniforms['amountOne'].value = 2 - blendStrength
      @blendPass.uniforms['amountTwo'].value = blendStrength
      @blendComposer.addPass @blendPass
    else
      @blendComposer.addPass @renderPass


    renderTargetBlend = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)

    if bloomParams? and !@activeVisualizer.no_glow
      @bloomPass = new (THREE.BloomPass)(bloomParams.strength,
                                         bloomParams.kernelSize,
                                         bloomParams.sigma,
                                         bloomParams.resolution)
      @blendComposer.addPass @bloomPass

    @noise = new THREE.ShaderPass(NoiseShader)
    @noise.uniforms['amount'].value = noiseAmount
    @blendComposer.addPass(@noise)

    @vhsPause = new THREE.ShaderPass(VHSPauseShader)
    @blendComposer.addPass @vhsPause

    renderTargetHud = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    @hudComposer = new (THREE.EffectComposer)(@renderer, renderTargetHud)
    @hudComposer.addPass hudPass

    @overlayComposer = new (THREE.EffectComposer)(@renderer)

    @hudBlendPass = new (THREE.ShaderPass)(DestOverlayBlendShader)
    @hudBlendPass.uniforms['tSource'].value = @blendComposer.renderTarget1.texture
    @hudBlendPass.uniforms['tDest'].value = @hudComposer.renderTarget2.texture

    @overlayComposer.addPass @hudBlendPass

    @badTV = new (THREE.ShaderPass)(THREE.BadTVShader)
    @badTV.uniforms['distortion'].value = 0.001
    @badTV.uniforms['distortion2'].value = 0.001
    @badTV.uniforms['speed'].value = 0.1
    @badTV.uniforms['rollSpeed'].value = 0.0
    @overlayComposer.addPass @badTV

    @crtEffect = new THREE.ShaderPass(CRTShader)
    @crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
    @crtEffect.renderToScreen = true
    @overlayComposer.addPass @crtEffect
    return

  Render: =>
    requestAnimationFrame(@Render)
    deltaTime = @clock.getDelta()
    return if deltaTime > 0.5

    if @activated
      if @shuffling
        if @clock.getElapsedTime() > @lastShuffleTime + 60
          @PickRandomVisualizer()
          @lastShuffleTime = @clock.getElapsedTime()

      if @clock.getElapsedTime() > @lastIcecastUpdateTime + 5
        @GetIcecastData() unless @paused
        @lastIcecastUpdateTime = @clock.getElapsedTime()

      if @volumeDisplayActive
        if @clock.getElapsedTime() > @lastVolumeUpdateTime + 2
          @ClearVolumeDisplay()

      if @playStatusTimerRunning
        if @clock.getElapsedTime() > @lastPlayStatusToggleTime + 4
          @ClearCanvasArea(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
          @playStatusTimerRunning = false

      if @channelDisplayActive
        if @clock.getElapsedTime() > @lastChannelUpdateTime + 4
          @ClearChannelDisplay()

      if @infoDisplayActive
        if @clock.getElapsedTime() > @lastInfoUpdateTime + 5
          @ClearInfoDisplay()

    if @audioInitializer.loading
      @ClearCanvasArea(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
      @DrawSpinner(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)

    if @paused
      @vhsPause.uniforms['time'].value = @clock.getElapsedTime()
    else
      if @vhsPause.uniforms['amount'].value > 0
        @vhsPause.uniforms['amount'].value = Math.max(@vhsPause.uniforms['amount'].value - 0.02, 0)
      @timer += deltaTime
      @UpdateAudioAnalyzer()
      @UpdateEffects()
      TWEEN.update()
      @activeVisualizer.Update(deltaTime)

    @activeVisualizer.Render()
    if @activeVisualizer.no_glow
      #@renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
      @cubeComposer.render(0.1)
      @glowComposer.render(0.1)
      @blendComposer.render(0.1)
      @hudComposer.render(0.1)
      @overlayComposer.render(0.1)
    else
      #@renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
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
    @badTV.uniforms['time'].value = @clock.getElapsedTime()
    @crtEffect.uniforms['time'].value = @clock.getElapsedTime()
    @noise.uniforms['time'].value = @clock.getElapsedTime()

    if !@activeVisualizer.no_glow and @activeVisualizer.bloomParams?
      @bloomPass.copyUniforms['opacity'].value = @activeVisualizer.bloomParams.strength + @strengthModifier

    if @audioInitializer.beatdetect.isKick() and @activeVisualizer.beatDistortionEffect
      @strengthModifier = if @activeVisualizer.bloomParams? then @activeVisualizer.bloomParams.strengthIncrease else 0
      @badTV.uniforms['distortion'].value = Math.random()
      @badTV.uniforms['distortion2'].value = Math.random()
      if Math.random() < 0.02
        @badTV.uniforms['rollSpeed'].value = (if Math.random() < 0.5 then Math.random() else -Math.random())
    else
      @strengthModifier = Math.max(@strengthModifier - 0.1, 0)
      @badTV.uniforms['distortion'].value = Math.max(@badTV.uniforms['distortion'].value - 0.1, 0.001)
      @badTV.uniforms['distortion2'].value = Math.max(@badTV.uniforms['distortion2'].value - 0.1, 0.001)
      if @badTV.uniforms['rollSpeed'].value > 0
        @badTV.uniforms['rollSpeed'].value = Math.max(@badTV.uniforms['rollSpeed'].value - 0.01, 0)
      else
        @badTV.uniforms['rollSpeed'].value = Math.min(@badTV.uniforms['rollSpeed'].value + 0.01, 0)

    return

  UpdateText: (songData) =>
    #still broken if song has dash in it but not multiple artsts
    # maybe check for duplication of artist name instead and base it on that
    if (@CountOccurrences(songData, ' - ') < 1)
      @artistName = 'you are tuned in'
      @songName = 'to vapor fm'
    else if (@CountOccurrences(songData, ' - ') == 1)
      @artistName = songData.split(' - ')[0]
      @songName = songData.split(' - ')[1]
    else
      artistSubStringLocation = @GetNthOccurrence(songData, ' - ', 1)
      songSubStringLocation = @GetNthOccurrence(songData, ' - ', 2)
      @artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation)
      @songName = songData.substring(songSubStringLocation + 3, songData.length)

    @artistName = @FittingString(@context1, @artistName, @canvas1.width * 0.8)
    @songName = @FittingString(@context1, @songName, @canvas1.width * 0.8)

    @UpdateOverlay()
    return

  FittingString: (c, str, maxWidth) ->
    width = c.measureText(str).width
    ellipsis = '...'
    ellipsisWidth = c.measureText(ellipsis).width
    if width <= maxWidth or width <= ellipsisWidth
      str
    else
      len = str.length
      while width >= maxWidth - ellipsisWidth and len-- > 0
        str = str.substring(0, len)
        width = c.measureText(str).width
      str + ellipsis

  UpdateOverlay: =>
    @context1.clearRect(0, @canvas1.height / 2, @canvas1.width * 0.85, @canvas1.height / 2)
    @context1.font = '50px TelegramaRaw'

    @context1.strokeStyle = 'black'
    @context1.lineWidth = 8
    @context1.strokeText(@artistName, 10, @canvas1.height * 0.9 - 50)
    @context1.strokeText(@songName, 10, @canvas1.height * 0.98 - 50)

    @context1.fillStyle = 'white'
    @context1.fillText(@artistName, 10, @canvas1.height * 0.9 - 50)
    @context1.fillText(@songName, 10, @canvas1.height * 0.98 - 50)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearCanvasArea: (startX, startY, width, height) =>
    @context1.clearRect(startX, startY, width, height)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  ClearLogo: =>
    min_dimension = Math.min(@canvas1.width * 0.12, @canvas1.height * 0.12)
    @context1.clearRect(@canvas1.width * 0.98 - min_dimension,
                        @canvas1.height * 0.98 - min_dimension,
                        min_dimension,
                        min_dimension)

  DrawLogo: =>
    @context1.globalAlpha = 0.5
    img = document.getElementById("logo")
    min_dimension = Math.min(@canvas1.width * 0.12, @canvas1.height * 0.12)
    @context1.drawImage(img,
                        @canvas1.width * 0.98 - min_dimension,
                        @canvas1.height * 0.98 - min_dimension,
                        min_dimension,
                        min_dimension)
    @context1.globalAlpha = 1.0
    return

  DrawSpinner: (startX, startY, width, height) =>
    lines = 16
    rotation = parseInt(@clock.getElapsedTime() * lines) / lines
    @context1.save()
    @context1.translate(startX + width * 0.5, startY + height * 0.5)
    @context1.rotate(Math.PI * 2 * rotation)
    for i in [0..lines-1]
      @context1.beginPath()
      @context1.rotate(Math.PI * 2 / lines)
      @context1.moveTo(Math.min(width, height) / 10, 0)
      @context1.lineTo(Math.min(width, height) / 4, 0)
      @context1.lineWidth = Math.min(width, height) / 30
      @context1.strokeStyle = "rgba(255,255,255," + i / lines + ")"
      @context1.stroke()
    @context1.restore()

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  DrawPlayIcon: (startX, startY, width, height) =>
    @context1.save()
    @context1.beginPath()
    @context1.translate(startX + width * 0.5, startY + height * 0.5)
    @context1.fillStyle = 'white'
    @context1.moveTo(width * 0.2, 0)
    @context1.lineTo(-width * 0.05, Math.min(width, height) * 0.25)
    @context1.lineTo(-width * 0.05, -Math.min(width, height) * 0.25)
    @context1.fill()
    @context1.restore()

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  DrawPauseIcon: (startX, startY, width, height) =>
    @context1.save()
    @context1.beginPath()
    @context1.translate(startX + width * 0.5, startY + height * 0.5)
    @context1.fillStyle = 'white'
    @context1.fillRect(-width * 0.1, -height * 0.2, width * 0.1, height * 0.4)
    @context1.fillRect(width * 0.1, -height * 0.2, width * 0.1, height * 0.4)
    @context1.restore()

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true
    return

  ClearVolumeDisplay: =>
    @volumeDisplayActive = false
    @context1.clearRect(0, 0, @canvas1.width / 2, @canvas1.height / 2)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  UpdateVolumeDisplay: (filledBarAmount) =>
    @ClearVolumeDisplay()
    @ClearInfoDisplay()

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
      @context1.fillRect(rectangleStartX + xOffset + i*volumeBarWidth,
                         rectangleStartY,
                         volumeBarWidth,
                         volumeBarHeight)
      xOffset += volumeBarWidth * 0.5
      i += 1

    i = filledBarAmount
    while i < 10
      @context1.fillRect(rectangleStartX + xOffset + i*volumeBarWidth,
                         rectangleStartY + volumeBarHeight * 0.5 - volumeBarHeight * 0.1,
                         volumeBarWidth,
                         volumeBarHeight * 0.1)
      xOffset += volumeBarWidth * 0.5
      i += 1

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    @lastVolumeUpdateTime = @clock.getElapsedTime()
    @volumeDisplayActive = true

    return

  DrawShuffleText: (enabled) =>
    @ClearVolumeDisplay()
    @context1.font = '60px TelegramaRaw'
    @context1.fillStyle = 'white'
    @context1.strokeStyle = 'black'

    if enabled
      @context1.strokeText('Shuffle: On', 10, 10)
      @context1.fillText('Shuffle: On', 10, 10)
    else
      @context1.strokeText('Shuffle: Off', 10, 10)
      @context1.fillText('Shuffle: Off', 10, 10)

    @lastVolumeUpdateTime = @clock.getElapsedTime()
    @volumeDisplayActive = true

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

  GetIcecastData: =>
    $.ajax({
      url: 'http://168.235.77.138:8000/status-json.xsl',
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

  Pause: =>
    @paused = true
    @vhsPause.uniforms['amount'].value = 1.0
    @ClearCanvasArea(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
    @DrawPauseIcon(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
    @lastPlayStatusToggleTime = @clock.getElapsedTime()
    @playStatusTimerRunning = true

    return

  AudioLoadedHandler: =>
    @paused = false
    @vhsPause.uniforms['amount'].value = 0.0
    @ClearCanvasArea(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
    @DrawPlayIcon(@canvas1.width * 0.8, 0, @canvas1.width * 0.25, @canvas1.height * 0.25)
    @lastPlayStatusToggleTime = @clock.getElapsedTime()
    @playStatusTimerRunning = true

    @GetIcecastData()

    return

  ShowInfo: =>
    @ClearVolumeDisplay()

    @context1.save()
    @context1.font = '38px TelegramaRaw'

    @context1.strokeStyle = 'black'
    @context1.lineWidth = 8
    @context1.strokeText('Created by Evan Hemsley', @canvas1.width * 0.02, @canvas1.height * 0.08 - 50)
    @context1.strokeText('@thatcosmonaut', @canvas1.width * 0.02, @canvas1.height * 0.16 - 50)

    @context1.fillStyle = 'white'
    @context1.fillText('Created by Evan Hemsley', @canvas1.width * 0.02, @canvas1.height * 0.08 - 50)
    @context1.fillText('@thatcosmonaut', @canvas1.width * 0.02, @canvas1.height * 0.16 - 50)
    @context1.restore()

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    @infoDisplayActive = true
    @lastInfoUpdateTime = @clock.getElapsedTime()
    return

  ClearInfoDisplay: =>
    @ClearCanvasArea(0, @canvas1.height * 0.08 - 50, @canvas1.width * 0.75, @canvas1.height * 0.4 - 50 + (38 * 1.55))
    @infoDisplayActive = false
    return

  ShowChannelDisplay: (channelNum) =>
    @ClearChannelDisplay()
    @playStatusTimerRunning = false

    if channelNum == 0
      channelNum = "A/V"

    channelNum = channelNum.toString()

    @context1.save()

    @context1.font = '100px TelegramaRaw'

    for i in [(channelNum.length - 1)..0] by -1
      @context1.strokeStyle = 'black'
      @context1.strokeText(channelNum[i],
                           @canvas1.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
                           @canvas1.height * 0.08 - 50)

      @context1.fillStyle = 'white'
      @context1.fillText(channelNum[i],
                         @canvas1.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
                         @canvas1.height * 0.08 - 50)

    @context1.restore()

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    @channelDisplayActive = true
    @lastChannelUpdateTime = @clock.getElapsedTime()
    return

  ClearChannelDisplay: =>
    @ClearCanvasArea(@canvas1.width * 0.65, 0, @canvas1.width, @canvas1.height * 0.08 - 50 + 150)
    @channelDisplayActive = false
    return

  RouteKeyDownInput: (keyCode) =>
    @activeVisualizer.HandleKeyDownInput(keyCode)

  RouteKeyUpInput: (keyCode) =>
    @activeVisualizer.HandleKeyUpInput(keyCode)
