const THREE = require('three')
const Visualizer = require('js/visualizer')
const Dolphin = require('js/objects/dolphin')

module.exports = class OceanVisualizer extends Visualizer {
  constructor (audioInitializer, renderer) {
    super(
      audioInitializer,
      { strength: 1.0, strengthIncrease: 0.0, kernelSize: 12.0, sigma: 1.5, resolution: 512 },
      0.0,
      2.0,
      true
    )
    this.InitWaterBox = this.InitWaterBox.bind(this)
    this.Sun = this.Sun.bind(this)
    this.Update = this.Update.bind(this)
    this.Render = this.Render.bind(this)
    this.CreateDolphin = this.CreateDolphin.bind(this)
    this.CleanDolphins = this.CleanDolphins.bind(this)

    this.renderer = renderer
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(0, 5, 6)

    this.directionalLight = new THREE.DirectionalLight(0xfdb813, 1.0)
    this.directionalLight.position.set(0, 0, 1)
    this.scene.add(this.directionalLight)

    this.pointLight = new THREE.PointLight(0xd3d3d3, 0.6, 200)
    this.pointLight.position.set(0, 5, 10)
    this.scene.add(this.pointLight)

    this.skyBox = this.SkyBox()
    this.scene.add(this.skyBox)

    this.InitWaterBox()

    this.loaded = false
    this.InitDolphin()
    this.dolphins = []

    this.sun = this.Sun()

    this.skyChangeTimer = 0
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(500, 500, 500)
    const material = new THREE.MeshBasicMaterial({color: 0xfe5b35, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  InitWaterBox () {
    const textureLoader = new THREE.TextureLoader()
    return textureLoader.load('vendor/images/waternormals.jpg', texture => {
      texture.wrapS = (texture.wrapT = THREE.RepeatWrapping)

      this.water = new THREE.Water(this.renderer, this.camera, this.scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: texture,
        alpha: 1.0,
        sunDirection: this.directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x1100aa,
        betaVersion: 0,
        side: THREE.DoubleSide
      })

      const meshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(500, 500, 10, 10),
        this.water.material
      )

      meshMirror.add(this.water)
      meshMirror.rotation.x = -Math.PI * 0.5
      return this.scene.add(meshMirror)
    })
  }

  InitDolphin () {
    const dolphinMaterial = new THREE.MeshPhongMaterial({color: 0x6c6876})
    const loader = new THREE.OBJLoader()
    loader.load('models/dolphin.obj', object => {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = dolphinMaterial
        }
      })
      object.scale.set(0.1, 0.1, 0.1)
      object.position.set(0, 2, -20)

      this.dolphin = object
      this.loaded = true
    })
  }

  Sun () {
    const geometry = new THREE.SphereGeometry(100, 32, 32)
    const material = new THREE.MeshBasicMaterial({color: 0xfdb813})
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(0, 0, -210)
    this.scene.add(sphere)
    return sphere
  }

  Update (deltaTime) {
    if (deltaTime != null) {
      this.skyChangeTimer += deltaTime
      this.water.material.uniforms.time.value += deltaTime

      if (this.loaded) {
        for (let dolphin of Array.from(this.dolphins)) {
          dolphin.Update()
        }

        this.CleanDolphins()

        if (this.audioInitializer.beatdetect.isKick()) {
          this.CreateDolphin()
        }

        if (this.skyChangeTimer > 10) {
          if (this.audioInitializer.beatdetect.isSnare()) {
            this.skyChangeTimer = 0

            const newColors = this.RandomSkySunColor()
            const sunColor = new THREE.Color(newColors.sun)
            const skyColor = new THREE.Color(newColors.sky)

            new TWEEN.Tween(this.skyBox.material.color)
              .to(skyColor, 1000)
              .start()
              .onUpdate(() => {
                this.skyBox.material.needsUpdate = true
              })

            new TWEEN.Tween(this.sun.material.color)
              .to(sunColor, 1000)
              .start()
              .onUpdate(() => {
                this.sun.material.needsUpdate = true
              })

            new TWEEN.Tween(this.directionalLight.color)
              .to(sunColor, 1000)
              .start()
          }
        }
      }
    }
  }

  Render () {
    this.water.render()
  }

  CreateDolphin () {
    const dolphin = new Dolphin(this.dolphin.clone())
    this.dolphins.push(dolphin)
    this.scene.add(dolphin.object)
  }

  CleanDolphins () {
    this.dolphins = this.dolphins.filter(dolphin => {
      if (dolphin.finished) { this.scene.remove(dolphin.object) }
      return !dolphin.finished
    })
  }

  RandomSkySunColor () {
    return this.RandomElt([
      {sun: 0xF4B940, sky: 0x2c5264},
      {sun: 0xE9BC55, sky: 0x586784},
      {sun: 0xDB5A6E, sky: 0x071D69},
      {sun: 0xF3F0A1, sky: 0x3C4884},
      {sun: 0xE49D4B, sky: 0xba538a},
      {sun: 0xfdb813, sky: 0xfe5b35},
      {sun: 0xE6A45A, sky: 0x1A2554}
    ])
  }

  RandomElt (array) {
    return array[Math.floor(Math.random() * array.length)]
  }
}
