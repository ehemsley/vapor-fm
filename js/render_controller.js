// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.RenderController = (function() {
    function RenderController(visualizers) {
      this.OnResize = bind(this.OnResize, this);
      this.Render = bind(this.Render, this);
      this.RenderProcess = bind(this.RenderProcess, this);
      this.NextVisualizer = bind(this.NextVisualizer, this);
      this.FadeIn = bind(this.FadeIn, this);
      this.FadeOut = bind(this.FadeOut, this);
      this.FadeToNext = bind(this.FadeToNext, this);
      this.visualizerElement = $('#visualizer');
      this.renderer = new THREE.WebGLRenderer;
      this.renderer.setClearColor(0x07020a);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.visualizerElement.append(this.renderer.domElement);
      this.visualizers = visualizers;
      this.visualizerCounter = 1;
      this.activeVisualizer = this.visualizers[this.visualizerCounter];
      this.fadingIn = false;
      this.fadingOut = false;
      this.fadeValue = 0.0;
      this.RenderProcess(this.activeVisualizer.scene, this.activeVisualizer.camera);
    }

    RenderController.prototype.FadeToNext = function() {
      return this.fadingOut = true;
    };

    RenderController.prototype.FadeOut = function() {
      if (this.fadeValue === 1.0) {
        this.fadingOut = false;
        this.NextVisualizer();
        this.fadingIn = true;
      } else {
        this.fadeValue = Math.min(this.fadeValue + 0.01, 1.0);
      }
      return this.fade.uniforms['fade'].value = this.fadeValue;
    };

    RenderController.prototype.FadeIn = function() {
      if (this.fadeValue === 0.0) {
        this.fadingIn = false;
      } else {
        this.fadeValue = Math.max(this.fadeValue - 0.01, 0.0);
      }
      return this.fade.uniforms['fade'].value = this.fadeValue;
    };

    RenderController.prototype.NextVisualizer = function() {
      this.visualizerCounter = (this.visualizerCounter + 1) % this.visualizers.length;
      this.activeVisualizer = this.visualizers[this.visualizerCounter];
      return this.RenderProcess(this.activeVisualizer.scene, this.activeVisualizer.camera);
    };

    RenderController.prototype.RenderProcess = function(scene, camera) {
      var bloomPass, film, horizontalBlur, renderPass, renderTargetCube, renderTargetGlow, renderTargetParameters, verticalBlur, vignette;
      renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: false
      };
      renderTargetCube = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.cubeComposer = new THREE.EffectComposer(this.renderer, renderTargetCube);
      renderPass = new THREE.RenderPass(scene, camera);
      this.cubeComposer.addPass(renderPass);
      renderTargetGlow = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
      this.glowComposer = new THREE.EffectComposer(this.renderer, renderTargetGlow);
      horizontalBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
      horizontalBlur.uniforms['h'].value = 2.0 / window.innerWidth;
      verticalBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
      verticalBlur.uniforms['v'].value = 2.0 / window.innerHeight;
      this.glowComposer.addPass(renderPass);
      this.glowComposer.addPass(horizontalBlur);
      this.glowComposer.addPass(verticalBlur);
      this.glowComposer.addPass(horizontalBlur);
      this.glowComposer.addPass(verticalBlur);
      this.blendPass = new THREE.ShaderPass(THREE.AdditiveBlendShader);
      this.blendPass.uniforms['tBase'].value = this.cubeComposer.renderTarget1;
      this.blendPass.uniforms['tAdd'].value = this.glowComposer.renderTarget1;
      this.blendPass.uniforms['amount'].value = 2.0;
      this.blendComposer = new THREE.EffectComposer(this.renderer);
      this.blendComposer.addPass(this.blendPass);
      bloomPass = new THREE.BloomPass(3, 12, 2.0, 512);
      this.blendComposer.addPass(bloomPass);
      this.badTV = new THREE.ShaderPass(THREE.BadTVShader);
      this.badTV.uniforms['distortion'].value = 1.0;
      this.badTV.uniforms['distortion2'].value = 1.0;
      this.badTV.uniforms['speed'].value = 0.1;
      this.badTV.uniforms['rollSpeed'].value = 0.0;
      this.blendComposer.addPass(this.badTV);
      this.rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
      this.rgbEffect.uniforms['amount'].value = 0.0015;
      this.rgbEffect.uniforms['angle'].value = 0;
      this.blendComposer.addPass(this.rgbEffect);
      film = new THREE.ShaderPass(THREE.FilmShader);
      film.uniforms['sCount'].value = 800;
      film.uniforms['sIntensity'].value = 0.9;
      film.uniforms['nIntensity'].value = 0.4;
      film.uniforms['grayscale'].value = 0;
      this.blendComposer.addPass(film);
      vignette = new THREE.ShaderPass(THREE.VignetteShader);
      vignette.uniforms['darkness'].value = 1;
      vignette.uniforms['offset'].value = 1.1;
      this.blendComposer.addPass(vignette);
      this.fade = new THREE.ShaderPass(THREE.FadeToBlackShader);
      this.fade.uniforms['fade'].value = this.fadeValue;
      this.fade.renderToScreen = true;
      this.blendComposer.addPass(this.fade);
    };

    RenderController.prototype.Render = function() {
      requestAnimationFrame(this.Render);
      if (this.fadingOut) {
        this.FadeOut();
      }
      if (this.fadingIn) {
        this.FadeIn();
      }
      this.activeVisualizer.Update();
      this.cubeComposer.render(0.1);
      this.glowComposer.render(0.1);
      this.blendComposer.render(0.1);
    };

    RenderController.prototype.OnResize = function() {
      var i, len, ref, renderH, renderW, visualizer;
      renderW = window.innerWidth;
      renderH = window.innerHeight;
      ref = this.visualizers;
      for (i = 0, len = ref.length; i < len; i++) {
        visualizer = ref[i];
        visualizer.camera.aspect = renderW / renderH;
        visualizer.camera.updateProjectionMatrix();
      }
      this.renderer.setSize(renderW, renderH);
      this.renderer.domElement.width = renderW;
      this.renderer.domElement.height = renderH;
    };

    return RenderController;

  })();

}).call(this);
