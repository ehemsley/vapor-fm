// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.RenderController = (function() {
    function RenderController(audioInitializer) {
      this.ClearChannelDisplay = bind(this.ClearChannelDisplay, this);
      this.ShowChannelDisplay = bind(this.ShowChannelDisplay, this);
      this.ClearInfoDisplay = bind(this.ClearInfoDisplay, this);
      this.ShowInfo = bind(this.ShowInfo, this);
      this.AudioLoadedHandler = bind(this.AudioLoadedHandler, this);
      this.Pause = bind(this.Pause, this);
      this.GetIcecastData = bind(this.GetIcecastData, this);
      this.UpdateVolumeDisplay = bind(this.UpdateVolumeDisplay, this);
      this.ClearVolumeDisplay = bind(this.ClearVolumeDisplay, this);
      this.DrawPauseIcon = bind(this.DrawPauseIcon, this);
      this.DrawPlayIcon = bind(this.DrawPlayIcon, this);
      this.DrawSpinner = bind(this.DrawSpinner, this);
      this.ClearCanvasArea = bind(this.ClearCanvasArea, this);
      this.UpdateOverlay = bind(this.UpdateOverlay, this);
      this.UpdateText = bind(this.UpdateText, this);
      this.UpdateEffects = bind(this.UpdateEffects, this);
      this.UpdateAudioAnalyzer = bind(this.UpdateAudioAnalyzer, this);
      this.OnResize = bind(this.OnResize, this);
      this.Render = bind(this.Render, this);
      this.RenderProcess = bind(this.RenderProcess, this);
      this.PreviousVisualizer = bind(this.PreviousVisualizer, this);
      this.NextVisualizer = bind(this.NextVisualizer, this);
      var j, len, ref, visualizer;
      this.visualizerElement = $('#visualizer');
      this.audioInitializer = audioInitializer;
      this.paused = true;
      this.clock = new THREE.Clock;
      this.clock.start();
      this.timer = 0;
      this.lastIcecastUpdateTime = this.clock.getElapsedTime();
      this.lastVolumeUpdatetime = this.clock.getElapsedTime();
      this.lastInfoUpdateTime = this.clock.getElapsedTime();
      this.lastChannelUpdateTime = this.clock.getElapsedTime();
      this.lastPlayStatusToggleTime = 0;
      this.playStatusTimerRunning = false;
      this.volumeDisplayActive = false;
      this.infoDisplayActive = false;
      this.renderer = new THREE.WebGLRenderer({
        alpha: true
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.visualizerElement.append(this.renderer.domElement);
      this.visualizers = [new Visualizer(this.audioInitializer), new HeartVisualizer(this.audioInitializer), new MystifyVisualizer(this.audioInitializer)];
      this.visualizerCounter = 0;
      this.activeVisualizer = this.visualizers[this.visualizerCounter];
      ref = this.visualizers;
      for (j = 0, len = ref.length; j < len; j++) {
        visualizer = ref[j];
        visualizer.Update();
      }
      this.hud = new THREE.Scene();
      this.hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
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
      this.context1.fillText('press i for info...', 10, this.canvas1.height * 0.9 - 50);
      this.texture1 = new THREE.Texture(this.canvas1);
      this.texture1.minFilter = THREE.LinearFilter;
      this.texture1.magFilter = THREE.LinearFilter;
      this.texture1.needsUpdate = true;
      this.material1 = new THREE.MeshBasicMaterial({
        map: this.texture1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      });
      this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas1.width, this.canvas1.height), this.material1);
      this.mesh1.position.set(0, 0, 0);
      this.hud.add(this.mesh1);
      this.hudCamera.position.set(0, 0, 2);
      this.RenderProcess(this.activeVisualizer.scene, this.activeVisualizer.camera);
      this.vhsPause.uniforms['amount'].value = 1.0;
    }

    RenderController.prototype.NextVisualizer = function() {
      this.visualizerCounter = (this.visualizerCounter + 1) % this.visualizers.length;
      this.activeVisualizer = this.visualizers[this.visualizerCounter];
      this.ShowChannelDisplay(this.visualizerCounter);
      this.RenderProcess(this.activeVisualizer.scene, this.activeVisualizer.camera);
    };

    RenderController.prototype.PreviousVisualizer = function() {
      if (this.visualizerCounter === 0) {
        this.visualizerCounter = this.visualizers.length - 1;
      } else {
        this.visualizerCounter = this.visualizerCounter - 1;
      }
      this.visualizerCounter = this.visualizerCounter;
      this.activeVisualizer = this.visualizers[this.visualizerCounter];
      this.ShowChannelDisplay(this.visualizerCounter);
      this.RenderProcess(this.activeVisualizer.scene, this.activeVisualizer.camera);
    };

    RenderController.prototype.RenderProcess = function(scene, camera) {
      var bloomPass, horizontalBlur, hudPass, renderTargetBlend, renderTargetCube, renderTargetGlow, renderTargetHud, renderTargetParameters, verticalBlur;
      renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
      };
      renderTargetCube = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.cubeComposer = new THREE.EffectComposer(this.renderer, renderTargetCube);
      this.renderPass = new THREE.RenderPass(scene, camera);
      hudPass = new THREE.RenderPass(this.hud, this.hudCamera);
      this.cubeComposer.addPass(this.renderPass);
      renderTargetGlow = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.glowComposer = new THREE.EffectComposer(this.renderer, renderTargetGlow);
      horizontalBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
      horizontalBlur.uniforms['h'].value = 1.0 / window.innerWidth;
      verticalBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
      verticalBlur.uniforms['v'].value = 1.0 / window.innerHeight;
      this.glowComposer.addPass(this.renderPass);
      this.glowComposer.addPass(horizontalBlur);
      this.glowComposer.addPass(verticalBlur);
      this.glowComposer.addPass(horizontalBlur);
      this.glowComposer.addPass(verticalBlur);
      this.blendPass = new THREE.ShaderPass(THREE.AdditiveBlendShader);
      this.blendPass.uniforms['tBase'].value = this.cubeComposer.renderTarget1;
      this.blendPass.uniforms['tAdd'].value = this.glowComposer.renderTarget1;
      this.blendPass.uniforms['amount'].value = 2.0;
      renderTargetBlend = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.blendComposer = new THREE.EffectComposer(this.renderer, renderTargetBlend);
      this.blendComposer.addPass(this.blendPass);
      bloomPass = new THREE.BloomPass(3, 12, 2.0, 512);
      this.blendComposer.addPass(bloomPass);
      this.vhsPause = new THREE.ShaderPass(THREE.VHSPauseShader);
      this.blendComposer.addPass(this.vhsPause);
      renderTargetHud = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.hudComposer = new THREE.EffectComposer(this.renderer, renderTargetHud);
      this.hudComposer.addPass(hudPass);
      this.overlayComposer = new THREE.EffectComposer(this.renderer);
      this.hudBlendPass = new THREE.ShaderPass(THREE.DestOverlayBlendShader);
      this.hudBlendPass.uniforms['tSource'].value = this.blendComposer.renderTarget2;
      this.hudBlendPass.uniforms['tDest'].value = this.hudComposer.renderTarget2;
      this.overlayComposer.addPass(this.hudBlendPass);
      this.badTV = new THREE.ShaderPass(THREE.BadTVShader);
      this.badTV.uniforms['distortion'].value = 0.001;
      this.badTV.uniforms['distortion2'].value = 0.001;
      this.badTV.uniforms['speed'].value = 0.1;
      this.badTV.uniforms['rollSpeed'].value = 0.0;
      this.overlayComposer.addPass(this.badTV);
      this.crtEffect = new THREE.ShaderPass(THREE.CRTShader);
      this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
      this.crtEffect.renderToScreen = true;
      this.overlayComposer.addPass(this.crtEffect);
    };

    RenderController.prototype.Render = function() {
      var deltaTime;
      deltaTime = this.clock.getDelta();
      if (this.clock.getElapsedTime() > this.lastIcecastUpdateTime + 5) {
        if (!this.paused) {
          this.GetIcecastData();
        }
        this.lastIcecastUpdateTime = this.clock.getElapsedTime();
      }
      if (this.volumeDisplayActive) {
        if (this.clock.getElapsedTime() > this.lastVolumeUpdateTime + 2) {
          this.ClearVolumeDisplay();
        }
      }
      if (this.playStatusTimerRunning) {
        if (this.clock.getElapsedTime() > this.lastPlayStatusToggleTime + 4) {
          this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
          this.playStatusTimerRunning = false;
        }
      }
      if (this.channelDisplayActive) {
        if (this.clock.getElapsedTime() > this.lastChannelUpdateTime + 4) {
          this.ClearChannelDisplay();
        }
      }
      if (this.infoDisplayActive) {
        if (this.clock.getElapsedTime() > this.lastInfoUpdateTime + 5) {
          this.ClearInfoDisplay();
        }
      }
      if (this.paused) {
        this.vhsPause.uniforms['time'].value = this.clock.getElapsedTime();
        if (this.audioInitializer.loading) {
          this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
          this.DrawSpinner(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
        }
      } else {
        this.timer += deltaTime;
        this.UpdateAudioAnalyzer();
        this.UpdateEffects();
        this.activeVisualizer.Update(deltaTime);
      }
      this.cubeComposer.render(0.1);
      this.glowComposer.render(0.1);
      this.blendComposer.render(0.1);
      this.hudComposer.render(0.1);
      this.overlayComposer.render(0.1);
      requestAnimationFrame(this.Render);
    };

    RenderController.prototype.OnResize = function() {
      var j, len, ref, renderH, renderW, visualizer;
      renderW = window.innerWidth;
      renderH = window.innerHeight;
      ref = this.visualizers;
      for (j = 0, len = ref.length; j < len; j++) {
        visualizer = ref[j];
        visualizer.camera.aspect = renderW / renderH;
        visualizer.camera.updateProjectionMatrix();
      }
      this.crtEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
      this.renderer.setSize(renderW, renderH);
      this.renderer.domElement.width = renderW;
      this.renderer.domElement.height = renderH;
    };

    RenderController.prototype.UpdateAudioAnalyzer = function() {
      this.audioInitializer.analyser.getByteFrequencyData(this.audioInitializer.frequencyData);
      this.audioInitializer.analyser.getFloatTimeDomainData(this.audioInitializer.floats);
      this.audioInitializer.beatdetect.detect(this.audioInitializer.floats);
    };

    RenderController.prototype.UpdateEffects = function() {
      this.badTV.uniforms['time'].value = this.clock.getElapsedTime();
      this.crtEffect.uniforms['time'].value = this.clock.getElapsedTime();
      if (this.audioInitializer.beatdetect.isKick() && this.activeVisualizer.beatDistortionEffect) {
        this.badTV.uniforms['distortion'].value = Math.random();
        this.badTV.uniforms['distortion2'].value = Math.random();
        if (Math.random() < 0.02) {
          this.badTV.uniforms['rollSpeed'].value = (Math.random() < 0.5 ? Math.random() : -Math.random());
        }
      } else {
        this.badTV.uniforms['distortion'].value = Math.max(this.badTV.uniforms['distortion'].value - 0.1, 0.001);
        this.badTV.uniforms['distortion2'].value = Math.max(this.badTV.uniforms['distortion2'].value - 0.1, 0.001);
        if (this.badTV.uniforms['rollSpeed'].value > 0) {
          this.badTV.uniforms['rollSpeed'].value = Math.max(this.badTV.uniforms['rollSpeed'].value - 0.01, 0);
        } else {
          this.badTV.uniforms['rollSpeed'].value = Math.min(this.badTV.uniforms['rollSpeed'].value + 0.01, 0);
        }
      }
    };

    RenderController.prototype.UpdateText = function(songData) {
      var artistSubStringLocation, songSubStringLocation;
      if (this.CountOccurrences(songData, ' - ') < 1) {
        this.artistName = 'N/A';
        this.songName = 'N/A';
      } else if (this.CountOccurrences(songData, ' - ') === 1) {
        this.artistName = songData.split(' - ')[0];
        this.songName = songData.split(' - ')[1];
      } else {
        artistSubStringLocation = this.GetNthOccurrence(songData, ' - ', 1);
        songSubStringLocation = this.GetNthOccurrence(songData, ' - ', 2);
        this.artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation);
        this.songName = songData.substring(songSubStringLocation + 3, songData.length);
      }
      this.UpdateOverlay();
    };

    RenderController.prototype.UpdateOverlay = function() {
      this.context1.clearRect(0, this.canvas1.height / 2, this.canvas1.width, this.canvas1.height / 2);
      this.context1.font = '50px TelegramaRaw';
      this.context1.strokeStyle = 'black';
      this.context1.lineWidth = 8;
      this.context1.strokeText(this.artistName, 10, this.canvas1.height * 0.9 - 50);
      this.context1.strokeText(this.songName, 10, this.canvas1.height * 0.98 - 50);
      this.context1.fillStyle = 'white';
      this.context1.fillText(this.artistName, 10, this.canvas1.height * 0.9 - 50);
      this.context1.fillText(this.songName, 10, this.canvas1.height * 0.98 - 50);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.ClearCanvasArea = function(startX, startY, width, height) {
      this.context1.clearRect(startX, startY, width, height);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.DrawSpinner = function(startX, startY, width, height) {
      var i, j, lines, ref, rotation;
      lines = 16;
      rotation = parseInt(this.clock.getElapsedTime() * lines) / lines;
      this.context1.save();
      this.context1.translate(startX + width * 0.5, startY + height * 0.5);
      this.context1.rotate(Math.PI * 2 * rotation);
      for (i = j = 0, ref = lines - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        this.context1.beginPath();
        this.context1.rotate(Math.PI * 2 / lines);
        this.context1.moveTo(Math.min(width, height) / 10, 0);
        this.context1.lineTo(Math.min(width, height) / 4, 0);
        this.context1.lineWidth = Math.min(width, height) / 30;
        this.context1.strokeStyle = "rgba(255,255,255," + i / lines + ")";
        this.context1.stroke();
      }
      this.context1.restore();
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.DrawPlayIcon = function(startX, startY, width, height) {
      this.context1.save();
      this.context1.beginPath();
      this.context1.translate(startX + width * 0.5, startY + height * 0.5);
      this.context1.fillStyle = 'white';
      this.context1.moveTo(width * 0.2, 0);
      this.context1.lineTo(-width * 0.05, Math.min(width, height) * 0.25);
      this.context1.lineTo(-width * 0.05, -Math.min(width, height) * 0.25);
      this.context1.fill();
      this.context1.restore();
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.DrawPauseIcon = function(startX, startY, width, height) {
      this.context1.save();
      this.context1.beginPath();
      this.context1.translate(startX + width * 0.5, startY + height * 0.5);
      this.context1.fillStyle = 'white';
      this.context1.fillRect(-width * 0.1, -height * 0.2, width * 0.1, height * 0.4);
      this.context1.fillRect(width * 0.1, -height * 0.2, width * 0.1, height * 0.4);
      this.context1.restore();
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.ClearVolumeDisplay = function() {
      this.volumeDisplayActive = false;
      this.context1.clearRect(0, 0, this.canvas1.width / 2, this.canvas1.height / 2);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    RenderController.prototype.UpdateVolumeDisplay = function(filledBarAmount) {
      var i, rectangleStartX, rectangleStartY, volumeBarHeight, volumeBarWidth, xOffset;
      this.ClearVolumeDisplay();
      this.ClearInfoDisplay();
      filledBarAmount = Math.min(Math.round(filledBarAmount), 10);
      rectangleStartX = 10;
      rectangleStartY = 70;
      volumeBarWidth = Math.round(this.canvas1.width * 0.02);
      volumeBarHeight = Math.round(this.canvas1.height * 0.1);
      xOffset = 0;
      this.context1.font = '60px TelegramaRaw';
      this.context1.fillStyle = 'green';
      this.context1.fillText('Volume', 10, 0);
      i = 0;
      while (i < filledBarAmount) {
        this.context1.fillRect(rectangleStartX + xOffset + i * volumeBarWidth, rectangleStartY, volumeBarWidth, volumeBarHeight);
        xOffset += volumeBarWidth * 0.5;
        i += 1;
      }
      i = filledBarAmount;
      while (i < 10) {
        this.context1.fillRect(rectangleStartX + xOffset + i * volumeBarWidth, rectangleStartY + volumeBarHeight * 0.5 - volumeBarHeight * 0.1, volumeBarWidth, volumeBarHeight * 0.1);
        xOffset += volumeBarWidth * 0.5;
        i += 1;
      }
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
      this.lastVolumeUpdateTime = this.clock.getElapsedTime();
      this.volumeDisplayActive = true;
    };

    RenderController.prototype.GetIcecastData = function() {
      $.ajax({
        url: 'http://vapor.fm:8000/status-json.xsl',
        type: 'GET',
        success: (function(_this) {
          return function(data) {
            return _this.UpdateText(data.icestats.source.title);
          };
        })(this),
        failure: function(status) {
          return console.log('status: ' + status);
        },
        dataType: 'json',
        timeout: 2000
      });
    };

    RenderController.prototype.GetNthOccurrence = function(str, m, i) {
      return str.split(m, i).join(m).length;
    };

    RenderController.prototype.CountOccurrences = function(str, value) {
      var regExp;
      regExp = new RegExp(value, "gi");
      return (str.match(regExp) || []).length;
    };

    RenderController.prototype.Pause = function() {
      this.paused = true;
      this.vhsPause.uniforms['amount'].value = 1.0;
      this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
      this.DrawPauseIcon(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
      this.lastPlayStatusToggleTime = this.clock.getElapsedTime();
      this.playStatusTimerRunning = true;
    };

    RenderController.prototype.AudioLoadedHandler = function() {
      this.paused = false;
      this.vhsPause.uniforms['amount'].value = 0.0;
      this.ClearCanvasArea(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
      this.DrawPlayIcon(this.canvas1.width * 0.8, 0, this.canvas1.width * 0.25, this.canvas1.height * 0.25);
      this.lastPlayStatusToggleTime = this.clock.getElapsedTime();
      this.playStatusTimerRunning = true;
      this.GetIcecastData();
    };

    RenderController.prototype.ShowInfo = function() {
      this.ClearVolumeDisplay();
      this.context1.save();
      this.context1.font = '38px TelegramaRaw';
      this.context1.strokeStyle = 'black';
      this.context1.lineWidth = 8;
      this.context1.strokeText('Created by Evan Hemsley', this.canvas1.width * 0.02, this.canvas1.height * 0.08 - 50);
      this.context1.strokeText('@thatcosmonaut', this.canvas1.width * 0.02, this.canvas1.height * 0.16 - 50);
      this.context1.strokeText(String.fromCharCode(8592) + ' or ' + String.fromCharCode(8594) + ' to change channel', this.canvas1.width * 0.02, this.canvas1.height * 0.24 - 50);
      this.context1.strokeText(String.fromCharCode(8593) + ' or ' + String.fromCharCode(8595) + ' to adjust volume', this.canvas1.width * 0.02, this.canvas1.height * 0.32 - 50);
      this.context1.strokeText('Space to pause/play', this.canvas1.width * 0.02, this.canvas1.height * 0.4 - 50);
      this.context1.fillStyle = 'white';
      this.context1.fillText('Created by Evan Hemsley', this.canvas1.width * 0.02, this.canvas1.height * 0.08 - 50);
      this.context1.fillText('@thatcosmonaut', this.canvas1.width * 0.02, this.canvas1.height * 0.16 - 50);
      this.context1.fillText(String.fromCharCode(8592) + ' or ' + String.fromCharCode(8594) + ' to change channel', this.canvas1.width * 0.02, this.canvas1.height * 0.24 - 50);
      this.context1.fillText(String.fromCharCode(8593) + ' or ' + String.fromCharCode(8595) + ' to adjust volume', this.canvas1.width * 0.02, this.canvas1.height * 0.32 - 50);
      this.context1.fillText('Space to pause/play', this.canvas1.width * 0.02, this.canvas1.height * 0.4 - 50);
      this.context1.restore();
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
      this.infoDisplayActive = true;
      this.lastInfoUpdateTime = this.clock.getElapsedTime();
    };

    RenderController.prototype.ClearInfoDisplay = function() {
      this.ClearCanvasArea(this.canvas1.width * 0.02, this.canvas1.height * 0.08 - 50, this.canvas1.width * 0.75, this.canvas1.height * 0.5 - 50);
      this.infoDisplayActive = false;
    };

    RenderController.prototype.ShowChannelDisplay = function(channelNum) {
      this.ClearChannelDisplay();
      this.playStatusTimerRunning = false;
      this.context1.save();
      this.context1.font = '100px TelegramaRaw';
      this.context1.strokeStyle = 'black';
      this.context1.strokeText(channelNum + 3, this.canvas1.width * 0.9, this.canvas1.height * 0.08 - 50);
      this.context1.fillStyle = 'white';
      this.context1.fillText(channelNum + 3, this.canvas1.width * 0.9, this.canvas1.height * 0.08 - 50);
      this.context1.restore();
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
      this.channelDisplayActive = true;
      this.lastChannelUpdateTime = this.clock.getElapsedTime();
    };

    RenderController.prototype.ClearChannelDisplay = function() {
      this.ClearCanvasArea(this.canvas1.width * 0.9, this.canvas1.height * 0.08 - 50, this.canvas1.width, this.canvas1.height * 0.24 - 50);
      this.channelDisplayActive = false;
    };

    return RenderController;

  })();

}).call(this);
