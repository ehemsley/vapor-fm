// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.HeartVisualizer = (function() {
    function HeartVisualizer(audioInitializer) {
      this.OnResize = bind(this.OnResize, this);
      this.Render = bind(this.Render, this);
      this.audioInitializer = audioInitializer;
      this.visualizerElement = $('#visualizer');
      this.timer = 0;
      this.scene = new THREE.Scene;
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
      this.pointLight.position.set(10, 20, 20);
      this.scene.add(this.pointLight);
      this.renderer = new THREE.WebGLRenderer;
      this.renderer.setClearColor(0x07020a);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.visualizerElement.append(this.renderer.domElement);
      this.Heart();
      this.camera.position.z = 20;
      return;
    }

    HeartVisualizer.prototype.Heart = function() {
      var heartMaterial, loader;
      heartMaterial = new THREE.MeshPhongMaterial({
        color: 0xff00000
      });
      loader = new THREE.OBJLoader;
      loader.load('models/heart.obj', (function(_this) {
        return function(object) {
          object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
              return child.material = heartMaterial;
            }
          });
          _this.heart = object;
          return _this.scene.add(object);
        };
      })(this));
    };

    HeartVisualizer.prototype.Render = function() {
      requestAnimationFrame(this.Render);
      this.timer += 0.01;
      if (this.heart != null) {
        this.heart.rotation.y = this.timer;
      }
      this.renderer.render(this.scene, this.camera);
    };

    HeartVisualizer.prototype.OnResize = function() {
      var renderH, renderW;
      renderW = window.innerWidth;
      renderH = window.innerHeight;
      this.camera.aspect = renderW / renderH;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(renderW, renderH);
      this.renderer.domElement.width = renderW;
      this.renderer.domElement.height = renderH;
    };

    return HeartVisualizer;

  })();

}).call(this);
