// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.StartScreen = (function() {
    function StartScreen() {
      this.Update = bind(this.Update, this);
      this.DisplayLoading = bind(this.DisplayLoading, this);
      this.ClearText = bind(this.ClearText, this);
      this.ClearFlashingText = bind(this.ClearFlashingText, this);
      this.ClearHeaderText = bind(this.ClearHeaderText, this);
      this.DrawLoadingText = bind(this.DrawLoadingText, this);
      this.DrawFlashingText = bind(this.DrawFlashingText, this);
      this.DrawHeaderText = bind(this.DrawHeaderText, this);
      this.DrawTestRect = bind(this.DrawTestRect, this);
      this.InitializeCanvas = bind(this.InitializeCanvas, this);
      this.timer = 0;
      this.scene = new THREE.Scene;
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.bloomParams = {
        strength: 1.0,
        strengthIncrease: 0,
        kernelSize: 12.0,
        sigma: 1.5,
        resolution: 512
      };
      this.noiseAmount = 0.0;
      this.ambientLight = new THREE.AmbientLight(0x404040);
      this.scene.add(this.ambientLight);
      this.skyBox = this.SkyBox();
      this.scene.add(this.skyBox);
      this.InitializeCanvas();
      this.DrawHeaderText();
      this.textFlashing = true;
      this.flashingTextOn = false;
      this.firstFrame = false;
      this.camera.position.z = 40;
      return;
    }

    StartScreen.prototype.InitializeCanvas = function() {
      this.canvas1 = document.createElement('canvas');
      this.canvas1.width = 540;
      this.canvas1.height = 180;
      this.context1 = this.canvas1.getContext('2d');
      this.context1.font = "30px TelegramaRaw";
      this.context1.textBaseline = "top";
      this.context1.fillStyle = "rgba(255,255,255,0.95)";
      this.context1.strokeStyle = 'white';
      this.context1.lineWidth = 2;
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
      this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(180, 60), this.material1);
      this.mesh1.position.set(-4, 0, 0);
      return this.scene.add(this.mesh1);
    };

    StartScreen.prototype.DrawTestRect = function() {
      this.context1.fillRect(0, 0, 540, 180);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.DrawHeaderText = function() {
      this.ClearHeaderText();
      this.context1.textAlign = 'center';
      this.context1.font = '30px TelegramaRaw';
      this.context1.fillText('vapor.fm', 280, 0);
      this.context1.font = '20px TelegramaRaw';
      this.context1.fillText('evan hemsley', 280, 40);
      this.context1.font = '15px TelegramaRaw';
      this.context1.fillText('Channel: ' + String.fromCharCode(8592) + ' or ' + String.fromCharCode(8594), 280, 80);
      this.context1.fillText('Volume: ' + String.fromCharCode(8593) + ' or ' + String.fromCharCode(8595), 280, 100);
      this.context1.fillText('Space to pause/play', 280, 120);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.DrawFlashingText = function() {
      this.ClearFlashingText();
      this.context1.textAlign = 'center';
      this.context1.fillText('Press any key to begin...', 280, 150);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.DrawLoadingText = function() {
      this.context1.textAlign = 'center';
      this.context1.fillText('Loading...', 280, 150);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.ClearHeaderText = function() {
      this.ClearText(0, 0, 540, 150);
    };

    StartScreen.prototype.ClearFlashingText = function() {
      this.ClearText(0, 150, 540, 180);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.ClearText = function(left, top, right, bottom) {
      this.context1.clearRect(left, top, right, bottom);
      this.mesh1.material.map.needsUpdate = true;
      this.mesh1.material.needsUpdate = true;
    };

    StartScreen.prototype.SkyBox = function() {
      var geometry, material, skybox;
      geometry = new THREE.BoxGeometry(500, 500, 500);
      material = new THREE.MeshBasicMaterial({
        color: 0x1100ff,
        side: THREE.BackSide
      });
      skybox = new THREE.Mesh(geometry, material);
      return skybox;
    };

    StartScreen.prototype.DisplayLoading = function() {
      this.ClearFlashingText();
      this.DrawLoadingText();
      return this.textFlashing = false;
    };

    StartScreen.prototype.Update = function(deltaTime) {
      if (deltaTime != null) {
        this.timer += deltaTime;
      }
      if (this.textFlashing) {
        if (this.flashingTextOn) {
          if (this.timer > 1) {
            this.ClearFlashingText();
            this.flashingTextOn = false;
            this.timer = 0;
          }
        } else {
          if (this.timer > 1) {
            this.DrawFlashingText();
            this.flashingTextOn = true;
            this.timer = 0;
          }
        }
      }
      return this.DrawHeaderText();
    };

    StartScreen.prototype.HandleKeyDownInput = function(keyCode) {};

    StartScreen.prototype.HandleKeyUpInput = function(keyCode) {};

    return StartScreen;

  })();

}).call(this);
