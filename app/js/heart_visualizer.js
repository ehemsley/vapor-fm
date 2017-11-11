/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let HeartVisualizer;
const Visualizer = require('js/visualizer');

module.exports = (HeartVisualizer = class HeartVisualizer extends Visualizer {
  constructor(audioInitializer) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.Update = this.Update.bind(this);
    super(audioInitializer,
          { strength: 3, strengthIncrease: 0.0, kernelSize: 12, sigma: 2.0, resolution: 512 },
          0.0,
          2.0,
          false);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
    this.pointLight.position.set(10, 20, 20);
    this.scene.add(this.pointLight);

    this.skyBox = this.SkyBox();
    this.scene.add(this.skyBox);

    this.Hearts(40);

    this.camera.position.z = 20;

  }

  Heart() {
    const heartMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    const loader = new THREE.OBJLoader;
    loader.load('models/heart.obj', object => {
      object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          return child.material = heartMaterial;
        }
      });

      this.heart = object;
      return this.scene.add(object);
    });
  }

  Hearts(number) {
    this.hearts = [];
    const heartMaterial = new THREE.MeshPhongMaterial({color: 0xff0011});
    const loader = new THREE.OBJLoader;
    loader.load('models/heart.obj', object => {
      object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          return child.material = heartMaterial;
        }
      });

      object.userData = { extraRotation: 0 };
      object.rotation.set(this.RandomFloat(0, Math.PI/4), this.RandomFloat(0, Math.PI/4), 0);
      object.scale.set(0.25, 0.25, 0.25);

      for (let i = 0, end = number, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        const newObject = object.clone();
        this.hearts.push(newObject);
        this.scene.add(newObject);
      }

      return this.SetHeartsPositions();
    });
  }

  SetHeartsPositions() {
    const positions = [];
    for (let heart of Array.from(this.hearts)) {
      var position;
      let newPosition = new THREE.Vector3(this.RandomInt(-40, 40), this.RandomInt(-40, 40), this.RandomInt(-40, 40));
      let overlapping = undefined;
      if (positions.length === 0) { overlapping = false; } else { overlapping = true; }

      while (overlapping) {
        newPosition = new THREE.Vector3(this.RandomInt(-40, 40), this.RandomInt(-40, 40), this.RandomInt(-40, 40));
        overlapping = false;
        for (position of Array.from(positions)) {
          if (newPosition.distanceTo(position) < 8) {
            overlapping = true;
          }
        }
      }

      positions.push(newPosition);
      heart.position.set(newPosition.x, newPosition.y, newPosition.z);
    }

  }

  SkyBox() {
    const geometry = new THREE.BoxGeometry(500, 500, 500);
    const material = new THREE.MeshBasicMaterial({color: 0x0411ff, side: THREE.BackSide});
    const skybox = new THREE.Mesh(geometry, material);
    return skybox;
  }

  Update(deltaTime) {
    this.timer += 0.01;

    if (this.heart != null) { this.heart.rotation.y = this.timer; }

    if (this.hearts != null) {
      for (var heartObject of Array.from(this.hearts)) {
        if (heartObject != null) {
          heartObject.rotation.y += 0.01 + heartObject.userData.extraRotation;
          heartObject.rotation.x += heartObject.userData.extraRotation;
          heartObject.userData.extraRotation = Math.max(0, heartObject.userData.extraRotation - 0.01);
          heartObject.scale.x = Math.max(heartObject.scale.x - 0.001, 0.25);
          heartObject.scale.y = Math.max(heartObject.scale.y - 0.001, 0.25);
          heartObject.scale.z = Math.max(heartObject.scale.z - 0.001, 0.25);
        }
      }

      if (this.audioInitializer.beatdetect.isKick()) {
        const randomHeart = this.hearts[this.RandomInt(0, this.hearts.length)];
        if (randomHeart != null) { randomHeart.userData.extraRotation = 0.4; }
      }

      if (this.audioInitializer.beatdetect.isSnare()) {
        for (heartObject of Array.from(this.hearts)) {
          if (heartObject != null) {
            if (Math.random() < 0.33) { heartObject.scale.set(0.3, 0.3, 0.3); }
          }
        }
      }
    }

    this.camera.position.set(40 * Math.cos(this.timer * 0.5), 0, 40 * Math.sin(this.timer * 0.5));
    this.camera.lookAt(this.scene.position);

  }
});
