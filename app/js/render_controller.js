/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const THREE = require('three')

const NoiseVisualizer = require('js/noise_visualizer')
const PongVisualizer = require('js/pong_visualizer')
const BustVisualizer = require('js/bust_visualizer')
const MystifyVisualizer = require('js/mystify_visualizer')
const CybergridVisualizer = require('js/cybergrid_visualizer')
const HeartVisualizer = require('js/heart_visualizer')
const OceanVisualizer = require('js/ocean_visualizer')
const StartScreen = require('js/start_screen')

const NoiseShader = require('shaders/noise_shader')
const VHSPauseShader = require('shaders/vhs_pause_shader')
const DestOverlayBlendShader = require('shaders/dest_overlay_blend_shader')
const CRTShader = require('shaders/crt_shader')

module.exports = class RenderController {
  constructor (audioInitializer, ui) {
    this.visualizerElement = document.getElementById('visualizer')
    this.audioInitializer = audioInitializer

    this.paused = false
    this.shuffling = false

    this.clock = new THREE.Clock()
    this.clock.start()

    this.lastIcecastUpdateTime = this.clock.getElapsedTime()
    this.lastVolumeUpdatetime = this.clock.getElapsedTime()
    this.lastInfoUpdateTime = this.clock.getElapsedTime()
    this.lastChannelUpdateTime = this.clock.getElapsedTime()
    this.lastPlayStatusToggleTime = 0

    this.lastShuffleTime = this.clock.getElapsedTime()

    this.ui = ui

    this.playStatusTimerRunning = false
    this.volumeDisplayActive = false
    this.infoDisplayActive = false

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.visualizerElement.append(this.renderer.domElement)

    const noiseVisualizer = new NoiseVisualizer()
    this.visualizers = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => noiseVisualizer))
    this.visualizers[0] = new PongVisualizer(this.audioInitializer)
    this.visualizers[3] = new BustVisualizer(this.audioInitializer)
    this.visualizers[4] = new MystifyVisualizer(this.audioInitializer)
    this.visualizers[5] = new CybergridVisualizer(this.audioInitializer)
    this.visualizers[7] = new OceanVisualizer(this.audioInitializer, this.renderer)
    this.visualizers[14] = new HeartVisualizer(this.audioInitializer)

    this.visualizerCounter = 7

    this.shuffleIndices = [3, 4, 5, 7, 14]

    this.hud = new THREE.Scene()
    this.hudCamera = new THREE.OrthographicCamera(
      -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000)

    this.ambientLights = new THREE.AmbientLight(0x404040)
    this.hud.add(this.ambientLights)

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100)
    this.pointLight.position.set(10, 20, 20)
    this.hud.add(this.pointLight)

    this.uiTexture = new THREE.Texture(this.ui.canvas)
    this.uiTexture.minFilter = THREE.LinearFilter
    this.uiTexture.magFilter = THREE.LinearFilter
    this.uiTexture.needsUpdate = true

    this.uiMaterial = new THREE.MeshBasicMaterial({map: this.uiTexture, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    this.uiMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.ui.canvas.width, this.ui.canvas.height), this.uiMaterial)
    this.uiMesh.position.set(0, 0, 0)
    this.hud.add(this.uiMesh)

    this.hudCamera.position.set(0, 0, 2)

    this.SetVisualizer(new StartScreen())
    this.activated = false

    this.RenderProcess(this.activeVisualizer.scene,
      this.activeVisualizer.camera,
      this.activeVisualizer.bloomParams,
      this.activeVisualizer.noiseAmount,
      this.activeVisualizer.blendStrength)

    // @vhsPause.uniforms['amount'].value = 1.0
    this.strengthModifier = 0
  }

  Activate () {
    this.activated = true
    this.visualizerCounter = 2
    this.NextVisualizer()

    this.ui.drawLogo()
  }

  NextVisualizer () {
    this.visualizerCounter = (this.visualizerCounter + 1) % this.visualizers.length
    this.SetVisualizer(this.visualizers[this.visualizerCounter])
    if (this.shuffling) {
      this.shuffling = false
      this.drawShuffleText(this.shuffling)
    }
  }

  PreviousVisualizer () {
    if (this.visualizerCounter === 0) {
      this.visualizerCounter = this.visualizers.length - 1
    } else {
      this.visualizerCounter = this.visualizerCounter - 1
    }

    this.SetVisualizer(this.visualizers[this.visualizerCounter])
    if (this.shuffling) {
      this.shuffling = false
      this.drawShuffleText(this.shuffling)
    }
  }

  SetVisualizer (visualizer) {
    this.activeVisualizer = visualizer
    // @renderer.setClearColor(@activeVisualizer.clearColor, @activeVisualizer.clearOpacity)
    this.activeVisualizer.Activate()

    if (this.activeVisualizer.showChannelNum) {
      this.ui.drawChannelDisplay(this.visualizerCounter)
    }

    this.ui.clearLogo()
    if (this.activeVisualizer.showCornerLogo) {
      this.ui.drawLogo()
    }

    this.RenderProcess(this.activeVisualizer.scene,
      this.activeVisualizer.camera,
      this.activeVisualizer.bloomParams,
      this.activeVisualizer.noiseAmount,
      this.activeVisualizer.blendStrength)

    this.badTV.uniforms['rollSpeed'].value = 0.1
    this.vhsPause.uniforms['amount'].value = 1.0
  }

  ToggleShuffle () {
    this.shuffling = !this.shuffling
    this.drawShuffleText(this.shuffling)

    if (this.shuffling) {
      this.PickRandomVisualizer()
      this.lastShuffleTime = this.clock.getElapsedTime()
    }
  }

  PickRandomVisualizer () {
    let newVizIndex = this.visualizerCounter
    while (newVizIndex === this.visualizerCounter) {
      newVizIndex = this.shuffleIndices[Math.floor(Math.random() * this.shuffleIndices.length)]
    }
    this.SetVisualizer(this.visualizers[newVizIndex])
  }

  RenderProcess (scene, camera, bloomParams, noiseAmount, blendStrength) {
    const renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true
    }

    const renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.cubeComposer = new (THREE.EffectComposer)(this.renderer, renderTargetCube)
    this.renderPass = new (THREE.RenderPass)(scene, camera)
    const hudPass = new (THREE.RenderPass)(this.hud, this.hudCamera)

    const renderTargetBlend = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.cubeComposer.addPass(this.renderPass)
    this.blendComposer = new (THREE.EffectComposer)(this.renderer, renderTargetBlend)

    const renderTargetGlow = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.glowComposer = new (THREE.EffectComposer)(this.renderer, renderTargetGlow)

    const horizontalBlur = new (THREE.ShaderPass)(THREE.HorizontalBlurShader)
    horizontalBlur.uniforms['h'].value = 1.0 / window.innerWidth
    const verticalBlur = new (THREE.ShaderPass)(THREE.VerticalBlurShader)
    verticalBlur.uniforms['v'].value = 1.0 / window.innerHeight

    this.blendPass = new (THREE.ShaderPass)(THREE.AdditiveBlendShader)

    this.glowComposer.addPass(this.renderPass)
    if (!this.activeVisualizer.no_glow) {
      this.glowComposer.addPass(horizontalBlur)
      this.glowComposer.addPass(verticalBlur)
      // @glowComposer.addPass horizontalBlur
      // @glowComposer.addPass verticalBlur

      this.blendPass.uniforms['tBase'].value = this.cubeComposer.renderTarget2.texture
      this.blendPass.uniforms['tAdd'].value = this.glowComposer.renderTarget1.texture
      this.blendPass.uniforms['amountOne'].value = 2 - blendStrength
      this.blendPass.uniforms['amountTwo'].value = blendStrength
      this.blendComposer.addPass(this.blendPass)
    } else {
      this.blendComposer.addPass(this.renderPass)
    }

    if ((bloomParams != null) && !this.activeVisualizer.no_glow) {
      this.bloomPass = new (THREE.BloomPass)(bloomParams.strength,
        bloomParams.kernelSize,
        bloomParams.sigma,
        bloomParams.resolution)
      this.blendComposer.addPass(this.bloomPass)
    }

    this.noise = new THREE.ShaderPass(NoiseShader)
    this.noise.uniforms['amount'].value = noiseAmount
    this.blendComposer.addPass(this.noise)

    this.vhsPause = new THREE.ShaderPass(VHSPauseShader)
    this.blendComposer.addPass(this.vhsPause)

    const renderTargetHud = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters)
    this.hudComposer = new (THREE.EffectComposer)(this.renderer, renderTargetHud)
    this.hudComposer.addPass(hudPass)

    this.overlayComposer = new (THREE.EffectComposer)(this.renderer)

    this.hudBlendPass = new (THREE.ShaderPass)(DestOverlayBlendShader)
    this.hudBlendPass.uniforms['tSource'].value = this.blendComposer.renderTarget1.texture
    this.hudBlendPass.uniforms['tDest'].value = this.hudComposer.renderTarget2.texture

    this.overlayComposer.addPass(this.hudBlendPass)

    this.badTV = new (THREE.ShaderPass)(THREE.BadTVShader)
    this.badTV.uniforms['distortion'].value = 0.001
    this.badTV.uniforms['distortion2'].value = 0.001
    this.badTV.uniforms['speed'].value = 0.1
    this.badTV.uniforms['rollSpeed'].value = 0.0
    this.overlayComposer.addPass(this.badTV)

    this.crtEffect = new THREE.ShaderPass(CRTShader)
    this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
    this.crtEffect.renderToScreen = true
    this.overlayComposer.addPass(this.crtEffect)
  }

  Render () {
    requestAnimationFrame(() => { this.Render() })

    this.ui.update()
    this.uiMesh.material.map.needsUpdate = true
    this.uiMesh.material.needsUpdate = true

    const deltaTime = this.clock.getDelta()
    if (deltaTime > 0.5) { return }

    if (this.activated) {
      if (this.shuffling) {
        if (this.clock.getElapsedTime() > (this.lastShuffleTime + 60)) {
          this.PickRandomVisualizer()
          this.lastShuffleTime = this.clock.getElapsedTime()
        }
      }
    }

    if (this.audioInitializer.loading) {
      this.ui.clearPlayStatus()
      this.ui.drawSpinner()
    }

    if (this.paused) {
      this.vhsPause.uniforms['time'].value = this.clock.getElapsedTime()
    } else {
      if (this.vhsPause.uniforms['amount'].value > 0) {
        this.vhsPause.uniforms['amount'].value = Math.max(this.vhsPause.uniforms['amount'].value - 0.02, 0)
      }
      this.UpdateAudioAnalyzer()
      this.UpdateEffects()
      TWEEN.update()
      this.activeVisualizer.Update(deltaTime)
    }

    this.activeVisualizer.Render()
    if (this.activeVisualizer.no_glow) {
      // @renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
      this.cubeComposer.render(0.1)
      this.glowComposer.render(0.1)
      this.blendComposer.render(0.1)
      this.hudComposer.render(0.1)
      this.overlayComposer.render(0.1)
    } else {
      // @renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
      this.cubeComposer.render(0.1)
      this.glowComposer.render(0.1)
      this.blendComposer.render(0.1)
      this.hudComposer.render(0.1)
      this.overlayComposer.render(0.1)
    }
  }

  OnResize () {
    const renderW = window.innerWidth
    const renderH = window.innerHeight

    for (let visualizer of this.visualizers) {
      visualizer.camera.aspect = renderW / renderH
      visualizer.camera.updateProjectionMatrix()
    }

    this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight)

    this.renderer.setSize(renderW, renderH)
    this.renderer.domElement.width = renderW
    this.renderer.domElement.height = renderH
  }

  UpdateAudioAnalyzer () {
    this.audioInitializer.analyser.getByteFrequencyData(this.audioInitializer.frequencyData)
    this.audioInitializer.analyser.getFloatTimeDomainData(this.audioInitializer.floats)

    this.audioInitializer.beatdetect.detect(this.audioInitializer.floats)
  }

  UpdateEffects () {
    // @rgbEffect.uniforms['amount'].value = Math.sin(@timer * 2) * 0.01
    this.badTV.uniforms['time'].value = this.clock.getElapsedTime()
    this.crtEffect.uniforms['time'].value = this.clock.getElapsedTime()
    this.noise.uniforms['time'].value = this.clock.getElapsedTime()

    if (!this.activeVisualizer.no_glow && (this.activeVisualizer.bloomParams != null)) {
      this.bloomPass.copyUniforms['opacity'].value = this.activeVisualizer.bloomParams.strength + this.strengthModifier
    }

    if (this.audioInitializer.beatdetect.isKick() && this.activeVisualizer.beatDistortionEffect) {
      this.strengthModifier = (this.activeVisualizer.bloomParams != null) ? this.activeVisualizer.bloomParams.strengthIncrease : 0
      this.badTV.uniforms['distortion'].value = Math.random()
      this.badTV.uniforms['distortion2'].value = Math.random()
      if (Math.random() < 0.02) {
        this.badTV.uniforms['rollSpeed'].value = (Math.random() < 0.5 ? Math.random() : -Math.random())
      }
    } else {
      this.strengthModifier = Math.max(this.strengthModifier - 0.1, 0)
      this.badTV.uniforms['distortion'].value = Math.max(this.badTV.uniforms['distortion'].value - 0.1, 0.001)
      this.badTV.uniforms['distortion2'].value = Math.max(this.badTV.uniforms['distortion2'].value - 0.1, 0.001)
      if (this.badTV.uniforms['rollSpeed'].value > 0) {
        this.badTV.uniforms['rollSpeed'].value = Math.max(this.badTV.uniforms['rollSpeed'].value - 0.01, 0)
      } else {
        this.badTV.uniforms['rollSpeed'].value = Math.min(this.badTV.uniforms['rollSpeed'].value + 0.01, 0)
      }
    }
  }

  Pause () {
    this.paused = true
    this.vhsPause.uniforms['amount'].value = 1.0
    this.ui.drawPauseIcon()
    this.lastPlayStatusToggleTime = this.clock.getElapsedTime()
    this.playStatusTimerRunning = true
  }

  AudioLoadedHandler () {
    this.paused = false
    this.vhsPause.uniforms['amount'].value = 0.0
    this.ui.clearPlayStatus()
    this.ui.drawPlayIcon()
    this.lastPlayStatusToggleTime = this.clock.getElapsedTime()
    this.playStatusTimerRunning = true

    this.ui.getIcecastData()
  }

  RouteKeyDownInput (keyCode) {
    return this.activeVisualizer.HandleKeyDownInput(keyCode)
  }

  RouteKeyUpInput (keyCode) {
    return this.activeVisualizer.HandleKeyUpInput(keyCode)
  }
}
