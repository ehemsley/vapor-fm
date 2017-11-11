/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let RenderController;
const NoiseVisualizer = require('js/noise_visualizer');
const AlbumPickVisualizer = require('js/album_pick_visualizer');
const PongVisualizer = require('js/pong_visualizer');
const BustVisualizer = require('js/bust_visualizer');
const MystifyVisualizer = require('js/mystify_visualizer');
const CybergridVisualizer = require('js/cybergrid_visualizer');
const HeartVisualizer = require('js/heart_visualizer');
const OceanVisualizer = require('js/ocean_visualizer');
const StartScreen = require('js/start_screen');

const NoiseShader = require('shaders/noise_shader');
const VHSPauseShader = require('shaders/vhs_pause_shader');
const DestOverlayBlendShader = require('shaders/dest_overlay_blend_shader');
const CRTShader = require('shaders/crt_shader');

module.exports = (RenderController = class RenderController {
  constructor(audioInitializer) {
    this.Activate = this.Activate.bind(this);
    this.NextVisualizer = this.NextVisualizer.bind(this);
    this.PreviousVisualizer = this.PreviousVisualizer.bind(this);
    this.SetVisualizer = this.SetVisualizer.bind(this);
    this.ToggleShuffle = this.ToggleShuffle.bind(this);
    this.PickRandomVisualizer = this.PickRandomVisualizer.bind(this);
    this.RenderProcess = this.RenderProcess.bind(this);
    this.Render = this.Render.bind(this);
    this.OnResize = this.OnResize.bind(this);
    this.UpdateAudioAnalyzer = this.UpdateAudioAnalyzer.bind(this);
    this.UpdateEffects = this.UpdateEffects.bind(this);
    this.UpdateText = this.UpdateText.bind(this);
    this.UpdateOverlay = this.UpdateOverlay.bind(this);
    this.ClearCanvasArea = this.ClearCanvasArea.bind(this);
    this.ClearLogo = this.ClearLogo.bind(this);
    this.DrawLogo = this.DrawLogo.bind(this);
    this.DrawSpinner = this.DrawSpinner.bind(this);
    this.DrawPlayIcon = this.DrawPlayIcon.bind(this);
    this.DrawPauseIcon = this.DrawPauseIcon.bind(this);
    this.ClearVolumeDisplay = this.ClearVolumeDisplay.bind(this);
    this.UpdateVolumeDisplay = this.UpdateVolumeDisplay.bind(this);
    this.DrawShuffleText = this.DrawShuffleText.bind(this);
    this.GetIcecastData = this.GetIcecastData.bind(this);
    this.Pause = this.Pause.bind(this);
    this.AudioLoadedHandler = this.AudioLoadedHandler.bind(this);
    this.ShowInfo = this.ShowInfo.bind(this);
    this.ClearInfoDisplay = this.ClearInfoDisplay.bind(this);
    this.ShowChannelDisplay = this.ShowChannelDisplay.bind(this);
    this.ClearChannelDisplay = this.ClearChannelDisplay.bind(this);
    this.RouteKeyDownInput = this.RouteKeyDownInput.bind(this);
    this.RouteKeyUpInput = this.RouteKeyUpInput.bind(this);
    this.visualizerElement = $('#visualizer');
    this.audioInitializer = audioInitializer;

    this.paused = false;
    this.shuffling = false;

    this.clock = new THREE.Clock;
    this.clock.start();
    this.timer = 0;
    this.lastIcecastUpdateTime = this.clock.getElapsedTime();
    this.lastVolumeUpdatetime = this.clock.getElapsedTime();
    this.lastInfoUpdateTime = this.clock.getElapsedTime();
    this.lastChannelUpdateTime = this.clock.getElapsedTime();
    this.lastPlayStatusToggleTime = 0;

    this.lastShuffleTime = this.clock.getElapsedTime();

    this.playStatusTimerRunning = false;
    this.volumeDisplayActive = false;
    this.infoDisplayActive = false;

    this.renderer = new THREE.WebGLRenderer( {alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.visualizerElement.append(this.renderer.domElement);

    const noiseVisualizer = new NoiseVisualizer();
    this.visualizers = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => noiseVisualizer));
    this.visualizers[0] = new PongVisualizer(this.audioInitializer);
    this.visualizers[1] = new AlbumPickVisualizer(this.audioInitializer);
    this.visualizers[3] = new BustVisualizer(this.audioInitializer);
    this.visualizers[4] = new MystifyVisualizer(this.audioInitializer);
    this.visualizers[5] = new CybergridVisualizer(this.audioInitializer);
    this.visualizers[7] = new OceanVisualizer(this.audioInitializer, this.renderer);
    this.visualizers[14] = new HeartVisualizer(this.audioInitializer);

    this.visualizerCounter = 7;

    this.shuffleIndices = [3, 4, 5, 7, 14];

    this.hud = new THREE.Scene();
    this.hudCamera = new THREE.OrthographicCamera(
      -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);

    this.ambientLights = new THREE.AmbientLight(0x404040);
    this.hud.add(this.ambientLights);

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
    this.pointLight.position.set(10, 20, 20);
    this.hud.add(this.pointLight);

    this.canvas1 = document.createElement('canvas');
    this.canvas1.width = window.innerWidth;
    this.canvas1.height = window.innerHeight;
    this.context1 = this.canvas1.getContext('2d');
    this.context1.font = "50px TelegramaRaw";
    this.context1.textAlign = "left";
    this.context1.textBaseline = "top";
    this.context1.fillStyle = "rgba(255,255,255,0.95)";

    this.texture1 = new THREE.Texture(this.canvas1);
    this.texture1.minFilter = THREE.LinearFilter;
    this.texture1.magFilter = THREE.LinearFilter;
    this.texture1.needsUpdate = true;

    this.material1 = new THREE.MeshBasicMaterial({map: this.texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0});
    this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas1.width, this.canvas1.height), this.material1);
    this.mesh1.position.set(0, 0, 0);
    this.hud.add(this.mesh1);

    this.hudCamera.position.set(0,0,2);

    this.SetVisualizer(new StartScreen());
    this.activated = false;

    this.RenderProcess(this.activeVisualizer.scene,
                   this.activeVisualizer.camera,
                   this.activeVisualizer.bloomParams,
                   this.activeVisualizer.noiseAmount,
                   this.activeVisualizer.blendStrength);

    // @vhsPause.uniforms['amount'].value = 1.0
    this.strengthModifier = 0;
  }

  Activate() {
    this.activated = true;
    this.visualizerCounter = 2;
    this.NextVisualizer();

    this.DrawLogo();

  }

  NextVisualizer() {
    this.visualizerCounter = (this.visualizerCounter + 1) % this.visualizers.length;
    this.SetVisualizer(this.visualizers[this.visualizerCounter]);
    if (this.shuffling) {
      this.shuffling = false;
      this.DrawShuffleText(this.shuffling);
    }
  }

  PreviousVisualizer() {
    if (this.visualizerCounter === 0) {
      this.visualizerCounter = this.visualizers.length - 1;
    } else {
      this.visualizerCounter = this.visualizerCounter - 1;
    }

    this.SetVisualizer(this.visualizers[this.visualizerCounter]);
    if (this.shuffling) {
      this.shuffling = false;
      this.DrawShuffleText(this.shuffling);
    }
  }

  SetVisualizer(visualizer) {
    this.activeVisualizer = visualizer;
    //@renderer.setClearColor(@activeVisualizer.clearColor, @activeVisualizer.clearOpacity)
    this.activeVisualizer.Activate();

    if (this.activeVisualizer.showChannelNum) {
      this.ShowChannelDisplay(this.visualizerCounter);
    }

    this.ClearLogo();
    if (this.activeVisualizer.showCornerLogo) {
      this.DrawLogo();
    }

    this.RenderProcess(this.activeVisualizer.scene,
                   this.activeVisualizer.camera,
                   this.activeVisualizer.bloomParams,
                   this.activeVisualizer.noiseAmount,
                   this.activeVisualizer.blendStrength);

    this.badTV.uniforms['rollSpeed'].value = 0.1;
    this.vhsPause.uniforms['amount'].value = 1.0;
  }

  ToggleShuffle() {
    this.shuffling = !this.shuffling;
    this.DrawShuffleText(this.shuffling);

    if (this.shuffling) {
      this.PickRandomVisualizer();
      this.lastShuffleTime = this.clock.getElapsedTime();
    }
  }

  PickRandomVisualizer() {
    let newVizIndex = this.visualizerCounter;
    while (newVizIndex === this.visualizerCounter) {
      newVizIndex = this.shuffleIndices[Math.floor(Math.random() * this.shuffleIndices.length)];
    }
    this.SetVisualizer(this.visualizers[newVizIndex]);
  }

  RenderProcess(scene, camera, bloomParams, noiseAmount, blendStrength) {
    const renderTargetParameters = {
                              minFilter: THREE.LinearFilter,
                              magFilter: THREE.LinearFilter,
                              format: THREE.RGBAFormat,
                              stencilBuffer: true
                             };

    const renderTargetCube = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters);
    this.cubeComposer = new (THREE.EffectComposer)(this.renderer, renderTargetCube);
    this.renderPass = new (THREE.RenderPass)(scene, camera);
    const hudPass = new (THREE.RenderPass)(this.hud, this.hudCamera);

    this.cubeComposer.addPass(this.renderPass);
    this.blendComposer = new (THREE.EffectComposer)(this.renderer, renderTargetBlend);

    const renderTargetGlow = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters);
    this.glowComposer = new (THREE.EffectComposer)(this.renderer, renderTargetGlow);

    const horizontalBlur = new (THREE.ShaderPass)(THREE.HorizontalBlurShader);
    horizontalBlur.uniforms['h'].value = 1.0 / window.innerWidth;
    const verticalBlur = new (THREE.ShaderPass)(THREE.VerticalBlurShader);
    verticalBlur.uniforms['v'].value = 1.0 / window.innerHeight;

    this.blendPass = new (THREE.ShaderPass)(THREE.AdditiveBlendShader);

    this.glowComposer.addPass(this.renderPass);
    if (!this.activeVisualizer.no_glow) {
      this.glowComposer.addPass(horizontalBlur);
      this.glowComposer.addPass(verticalBlur);
      //@glowComposer.addPass horizontalBlur
      //@glowComposer.addPass verticalBlur

      this.blendPass.uniforms['tBase'].value = this.cubeComposer.renderTarget2.texture;
      this.blendPass.uniforms['tAdd'].value = this.glowComposer.renderTarget1.texture;
      this.blendPass.uniforms['amountOne'].value = 2 - blendStrength;
      this.blendPass.uniforms['amountTwo'].value = blendStrength;
      this.blendComposer.addPass(this.blendPass);
    } else {
      this.blendComposer.addPass(this.renderPass);
    }


    var renderTargetBlend = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters);

    if ((bloomParams != null) && !this.activeVisualizer.no_glow) {
      this.bloomPass = new (THREE.BloomPass)(bloomParams.strength,
                                         bloomParams.kernelSize,
                                         bloomParams.sigma,
                                         bloomParams.resolution);
      this.blendComposer.addPass(this.bloomPass);
    }

    this.noise = new THREE.ShaderPass(NoiseShader);
    this.noise.uniforms['amount'].value = noiseAmount;
    this.blendComposer.addPass(this.noise);

    this.vhsPause = new THREE.ShaderPass(VHSPauseShader);
    this.blendComposer.addPass(this.vhsPause);

    const renderTargetHud = new (THREE.WebGLRenderTarget)(window.innerWidth, window.innerHeight, renderTargetParameters);
    this.hudComposer = new (THREE.EffectComposer)(this.renderer, renderTargetHud);
    this.hudComposer.addPass(hudPass);

    this.overlayComposer = new (THREE.EffectComposer)(this.renderer);

    this.hudBlendPass = new (THREE.ShaderPass)(DestOverlayBlendShader);
    this.hudBlendPass.uniforms['tSource'].value = this.blendComposer.renderTarget1.texture;
    this.hudBlendPass.uniforms['tDest'].value = this.hudComposer.renderTarget2.texture;

    this.overlayComposer.addPass(this.hudBlendPass);

    this.badTV = new (THREE.ShaderPass)(THREE.BadTVShader);
    this.badTV.uniforms['distortion'].value = 0.001;
    this.badTV.uniforms['distortion2'].value = 0.001;
    this.badTV.uniforms['speed'].value = 0.1;
    this.badTV.uniforms['rollSpeed'].value = 0.0;
    this.overlayComposer.addPass(this.badTV);

    this.crtEffect = new THREE.ShaderPass(CRTShader);
    this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.crtEffect.renderToScreen = true;
    this.overlayComposer.addPass(this.crtEffect);

  }

  Render() {
    requestAnimationFrame(this.Render);
    const deltaTime = this.clock.getDelta();
    if (deltaTime > 0.5) { return; }

    if (this.activated) {
      if (this.shuffling) {
        if (this.clock.getElapsedTime() > (this.lastShuffleTime + 60)) {
          this.PickRandomVisualizer();
          this.lastShuffleTime = this.clock.getElapsedTime();
        }
      }

      if (this.clock.getElapsedTime() > (this.lastIcecastUpdateTime + 5)) {
        if (!this.paused) { this.GetIcecastData(); }
        this.lastIcecastUpdateTime = this.clock.getElapsedTime();
      }

      if (this.volumeDisplayActive) {
        if (this.clock.getElapsedTime() > (this.lastVolumeUpdateTime + 2)) {
          this.ClearVolumeDisplay();
        }
      }

      if (this.playStatusTimerRunning) {
        if (this.clock.getElapsedTime() > (this.lastPlayStatusToggleTime + 4)) {
          this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
          this.playStatusTimerRunning = false;
        }
      }

      if (this.channelDisplayActive) {
        if (this.clock.getElapsedTime() > (this.lastChannelUpdateTime + 4)) {
          this.ClearChannelDisplay();
        }
      }

      if (this.infoDisplayActive) {
        if (this.clock.getElapsedTime() > (this.lastInfoUpdateTime + 5)) {
          this.ClearInfoDisplay();
        }
      }
    }

    if (this.audioInitializer.loading) {
      this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
      this.DrawSpinner(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
    }

    if (this.paused) {
      this.vhsPause.uniforms['time'].value = this.clock.getElapsedTime();
    } else {
      if (this.vhsPause.uniforms['amount'].value > 0) {
        this.vhsPause.uniforms['amount'].value = Math.max(this.vhsPause.uniforms['amount'].value - 0.02, 0);
      }
      this.timer += deltaTime;
      this.UpdateAudioAnalyzer();
      this.UpdateEffects();
      TWEEN.update();
      this.activeVisualizer.Update(deltaTime);
    }

    this.activeVisualizer.Render();
    if (this.activeVisualizer.no_glow) {
      //@renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
      this.cubeComposer.render(0.1);
      this.glowComposer.render(0.1);
      this.blendComposer.render(0.1);
      this.hudComposer.render(0.1);
      this.overlayComposer.render(0.1);
    } else {
      //@renderer.render(@activeVisualizer.scene, @activeVisualizer.camera)
      this.cubeComposer.render(0.1);
      this.glowComposer.render(0.1);
      this.blendComposer.render(0.1);
      this.hudComposer.render(0.1);
      this.overlayComposer.render(0.1);
    }

  }

  OnResize() {
    const renderW = window.innerWidth;
    const renderH = window.innerHeight;

    for (let visualizer of Array.from(this.visualizers)) {
      visualizer.camera.aspect = renderW / renderH;
      visualizer.camera.updateProjectionMatrix();
    }

    this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);

    this.renderer.setSize(renderW, renderH);
    this.renderer.domElement.width = renderW;
    this.renderer.domElement.height = renderH;
  }

  UpdateAudioAnalyzer() {
    this.audioInitializer.analyser.getByteFrequencyData(this.audioInitializer.frequencyData);
    this.audioInitializer.analyser.getFloatTimeDomainData(this.audioInitializer.floats);

    this.audioInitializer.beatdetect.detect(this.audioInitializer.floats);
  }

  UpdateEffects() {
    // @rgbEffect.uniforms['amount'].value = Math.sin(@timer * 2) * 0.01
    this.badTV.uniforms['time'].value = this.clock.getElapsedTime();
    this.crtEffect.uniforms['time'].value = this.clock.getElapsedTime();
    this.noise.uniforms['time'].value = this.clock.getElapsedTime();

    if (!this.activeVisualizer.no_glow && (this.activeVisualizer.bloomParams != null)) {
      this.bloomPass.copyUniforms['opacity'].value = this.activeVisualizer.bloomParams.strength + this.strengthModifier;
    }

    if (this.audioInitializer.beatdetect.isKick() && this.activeVisualizer.beatDistortionEffect) {
      this.strengthModifier = (this.activeVisualizer.bloomParams != null) ? this.activeVisualizer.bloomParams.strengthIncrease : 0;
      this.badTV.uniforms['distortion'].value = Math.random();
      this.badTV.uniforms['distortion2'].value = Math.random();
      if (Math.random() < 0.02) {
        this.badTV.uniforms['rollSpeed'].value = (Math.random() < 0.5 ? Math.random() : -Math.random());
      }
    } else {
      this.strengthModifier = Math.max(this.strengthModifier - 0.1, 0);
      this.badTV.uniforms['distortion'].value = Math.max(this.badTV.uniforms['distortion'].value - 0.1, 0.001);
      this.badTV.uniforms['distortion2'].value = Math.max(this.badTV.uniforms['distortion2'].value - 0.1, 0.001);
      if (this.badTV.uniforms['rollSpeed'].value > 0) {
        this.badTV.uniforms['rollSpeed'].value = Math.max(this.badTV.uniforms['rollSpeed'].value - 0.01, 0);
      } else {
        this.badTV.uniforms['rollSpeed'].value = Math.min(this.badTV.uniforms['rollSpeed'].value + 0.01, 0);
      }
    }

  }

  UpdateText(songData) {
    //still broken if song has dash in it but not multiple artsts
    // maybe check for duplication of artist name instead and base it on that
    if (this.CountOccurrences(songData, ' - ') < 1) {
      this.artistName = 'you are tuned in';
      this.songName = 'to vapor fm';
    } else if (this.CountOccurrences(songData, ' - ') === 1) {
      this.artistName = songData.split(' - ')[0];
      this.songName = songData.split(' - ')[1];
    } else {
      const artistSubStringLocation = this.GetNthOccurrence(songData, ' - ', 1);
      const songSubStringLocation = this.GetNthOccurrence(songData, ' - ', 2);
      this.artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation);
      this.songName = songData.substring(songSubStringLocation + 3, songData.length);
    }

    this.artistName = this.FittingString(this.context1, this.artistName, this.canvas1.width * 0.8);
    this.songName = this.FittingString(this.context1, this.songName, this.canvas1.width * 0.8);

    this.UpdateOverlay();
  }

  FittingString(c, str, maxWidth) {
    let { width } = c.measureText(str);
    const ellipsis = '...';
    const ellipsisWidth = c.measureText(ellipsis).width;
    if ((width <= maxWidth) || (width <= ellipsisWidth)) {
      return str;
    } else {
      let len = str.length;
      while ((width >= (maxWidth - ellipsisWidth)) && (len-- > 0)) {
        str = str.substring(0, len);
        ({ width } = c.measureText(str));
      }
      return str + ellipsis;
    }
  }

  UpdateOverlay() {
    this.context1.clearRect(0, this.canvas1.height / 2, this.canvas1.width * 0.85, this.canvas1.height / 2);
    this.context1.font = '50px TelegramaRaw';

    this.context1.strokeStyle = 'black';
    this.context1.lineWidth = 8;
    this.context1.strokeText(this.artistName, 10, (this.canvas1.height * 0.9) - 50);
    this.context1.strokeText(this.songName, 10, (this.canvas1.height * 0.98) - 50);

    this.context1.fillStyle = 'white';
    this.context1.fillText(this.artistName, 10, (this.canvas1.height * 0.9) - 50);
    this.context1.fillText(this.songName, 10, (this.canvas1.height * 0.98) - 50);

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  ClearCanvasArea(startX, startY, width, height) {
    this.context1.clearRect(startX, startY, width, height);

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  ClearLogo() {
    const min_dimension = Math.min(this.canvas1.width * 0.12, this.canvas1.height * 0.12);
    return this.context1.clearRect((this.canvas1.width * 0.98) - min_dimension,
                        (this.canvas1.height * 0.98) - min_dimension,
                        min_dimension,
                        min_dimension);
  }

  DrawLogo() {
    this.context1.globalAlpha = 0.5;
    const img = document.getElementById("logo");
    const min_dimension = Math.min(this.canvas1.width * 0.12, this.canvas1.height * 0.12);
    this.context1.drawImage(img,
                        (this.canvas1.width * 0.98) - min_dimension,
                        (this.canvas1.height * 0.98) - min_dimension,
                        min_dimension,
                        min_dimension);
    this.context1.globalAlpha = 1.0;
  }

  DrawSpinner(startX, startY, width, height) {
    const lines = 16;
    const rotation = parseInt(this.clock.getElapsedTime() * lines) / lines;
    this.context1.save();
    this.context1.translate(startX + (width * 0.5), startY + (height * 0.5));
    this.context1.rotate(Math.PI * 2 * rotation);
    for (let i = 0, end = lines-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      this.context1.beginPath();
      this.context1.rotate((Math.PI * 2) / lines);
      this.context1.moveTo(Math.min(width, height) / 10, 0);
      this.context1.lineTo(Math.min(width, height) / 4, 0);
      this.context1.lineWidth = Math.min(width, height) / 30;
      this.context1.strokeStyle = `rgba(255,255,255,${i / lines})`;
      this.context1.stroke();
    }
    this.context1.restore();

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;
  }

  DrawPlayIcon(startX, startY, width, height) {
    this.context1.save();
    this.context1.beginPath();
    this.context1.translate(startX + (width * 0.5), startY + (height * 0.5));
    this.context1.fillStyle = 'white';
    this.context1.moveTo(width * 0.2, 0);
    this.context1.lineTo(-width * 0.05, Math.min(width, height) * 0.25);
    this.context1.lineTo(-width * 0.05, -Math.min(width, height) * 0.25);
    this.context1.fill();
    this.context1.restore();

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  DrawPauseIcon(startX, startY, width, height) {
    this.context1.save();
    this.context1.beginPath();
    this.context1.translate(startX + (width * 0.5), startY + (height * 0.5));
    this.context1.fillStyle = 'white';
    this.context1.fillRect(-width * 0.1, -height * 0.2, width * 0.1, height * 0.4);
    this.context1.fillRect(width * 0.1, -height * 0.2, width * 0.1, height * 0.4);
    this.context1.restore();

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;
  }

  ClearVolumeDisplay() {
    this.volumeDisplayActive = false;
    this.context1.clearRect(0, 0, this.canvas1.width / 2, this.canvas1.height / 2);

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  UpdateVolumeDisplay(filledBarAmount) {
    this.ClearVolumeDisplay();
    this.ClearInfoDisplay();

    filledBarAmount = Math.min(Math.round(filledBarAmount), 10);

    const rectangleStartX = 10;
    const rectangleStartY = 70;

    const volumeBarWidth = Math.round(this.canvas1.width * 0.02);
    const volumeBarHeight = Math.round(this.canvas1.height * 0.1);

    let xOffset = 0;

    this.context1.font = '60px TelegramaRaw';
    this.context1.fillStyle = 'green';
    this.context1.fillText('Volume', 10, 0);

    let i = 0;
    while (i < filledBarAmount) {
      this.context1.fillRect(rectangleStartX + xOffset + (i*volumeBarWidth),
                         rectangleStartY,
                         volumeBarWidth,
                         volumeBarHeight);
      xOffset += volumeBarWidth * 0.5;
      i += 1;
    }

    i = filledBarAmount;
    while (i < 10) {
      this.context1.fillRect(rectangleStartX + xOffset + (i*volumeBarWidth),
                         (rectangleStartY + (volumeBarHeight * 0.5)) - (volumeBarHeight * 0.1),
                         volumeBarWidth,
                         volumeBarHeight * 0.1);
      xOffset += volumeBarWidth * 0.5;
      i += 1;
    }

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

    this.lastVolumeUpdateTime = this.clock.getElapsedTime();
    this.volumeDisplayActive = true;

  }

  DrawShuffleText(enabled) {
    this.ClearVolumeDisplay();
    this.context1.font = '60px TelegramaRaw';
    this.context1.fillStyle = 'white';
    this.context1.strokeStyle = 'black';

    if (enabled) {
      this.context1.strokeText('Shuffle: On', 10, 10);
      this.context1.fillText('Shuffle: On', 10, 10);
    } else {
      this.context1.strokeText('Shuffle: Off', 10, 10);
      this.context1.fillText('Shuffle: Off', 10, 10);
    }

    this.lastVolumeUpdateTime = this.clock.getElapsedTime();
    this.volumeDisplayActive = true;

    this.mesh1.material.map.needsUpdate = true;
    return this.mesh1.material.needsUpdate = true;
  }

  GetIcecastData() {
    $.ajax({
      url: 'http://168.235.77.138:8000/status-json.xsl',
      type: 'GET',
      success: data => {
        return this.UpdateText(data.icestats.source.title);
      },
      failure(status) {
        return console.log(`status: ${status}`);
      },
      dataType: 'json',
      timeout: 2000
    });
  }

  GetNthOccurrence(str, m, i) {
    return str.split(m, i).join(m).length;
  }

  CountOccurrences(str, value) {
    const regExp = new RegExp(value, "gi");
    return (str.match(regExp) || []).length;
  }

  Pause() {
    this.paused = true;
    this.vhsPause.uniforms['amount'].value = 1.0;
    this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
    this.DrawPauseIcon(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
    this.lastPlayStatusToggleTime = this.clock.getElapsedTime();
    this.playStatusTimerRunning = true;

  }

  AudioLoadedHandler() {
    this.paused = false;
    this.vhsPause.uniforms['amount'].value = 0.0;
    this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
    this.DrawPlayIcon(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
    this.lastPlayStatusToggleTime = this.clock.getElapsedTime();
    this.playStatusTimerRunning = true;

    this.GetIcecastData();

  }

  ShowInfo() {
    this.ClearVolumeDisplay();

    this.context1.save();
    this.context1.font = '38px TelegramaRaw';

    this.context1.strokeStyle = 'black';
    this.context1.lineWidth = 8;
    this.context1.strokeText('Created by Evan Hemsley', this.canvas1.width * 0.02, (this.canvas1.height * 0.08) - 50);
    this.context1.strokeText('@thatcosmonaut', this.canvas1.width * 0.02, (this.canvas1.height * 0.16) - 50);

    this.context1.fillStyle = 'white';
    this.context1.fillText('Created by Evan Hemsley', this.canvas1.width * 0.02, (this.canvas1.height * 0.08) - 50);
    this.context1.fillText('@thatcosmonaut', this.canvas1.width * 0.02, (this.canvas1.height * 0.16) - 50);
    this.context1.restore();

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

    this.infoDisplayActive = true;
    this.lastInfoUpdateTime = this.clock.getElapsedTime();
  }

  ClearInfoDisplay() {
    this.ClearCanvasArea(0, (this.canvas1.height * 0.08) - 50, this.canvas1.width * 0.75, ((this.canvas1.height * 0.4) - 50) + (38 * 1.55));
    this.infoDisplayActive = false;
  }

  ShowChannelDisplay(channelNum) {
    this.ClearChannelDisplay();
    this.playStatusTimerRunning = false;

    if (channelNum === 0) {
      channelNum = "A/V";
    }

    channelNum = channelNum.toString();

    this.context1.save();

    this.context1.font = '100px TelegramaRaw';

    for (let i = channelNum.length - 1; i >= 0; i--) {
      this.context1.strokeStyle = 'black';
      this.context1.strokeText(channelNum[i],
                           this.canvas1.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
                           (this.canvas1.height * 0.08) - 50);

      this.context1.fillStyle = 'white';
      this.context1.fillText(channelNum[i],
                         this.canvas1.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
                         (this.canvas1.height * 0.08) - 50);
    }

    this.context1.restore();

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

    this.channelDisplayActive = true;
    this.lastChannelUpdateTime = this.clock.getElapsedTime();
  }

  ClearChannelDisplay() {
    this.ClearCanvasArea(this.canvas1.width * 0.65, 0, this.canvas1.width, ((this.canvas1.height * 0.08) - 50) + 150);
    this.channelDisplayActive = false;
  }

  RouteKeyDownInput(keyCode) {
    return this.activeVisualizer.HandleKeyDownInput(keyCode);
  }

  RouteKeyUpInput(keyCode) {
    return this.activeVisualizer.HandleKeyUpInput(keyCode);
  }
});
