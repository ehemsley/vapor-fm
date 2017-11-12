const THREE = require('three')

module.exports = class StartScreen {
  constructor () {
    this.InitializeCanvas = this.InitializeCanvas.bind(this)
    this.DrawTestRect = this.DrawTestRect.bind(this)
    this.DrawHeaderLogo = this.DrawHeaderLogo.bind(this)
    this.DrawHeaderText = this.DrawHeaderText.bind(this)
    this.DrawFlashingText = this.DrawFlashingText.bind(this)
    this.DrawLoadingText = this.DrawLoadingText.bind(this)
    this.ClearHeaderText = this.ClearHeaderText.bind(this)
    this.ClearFlashingText = this.ClearFlashingText.bind(this)
    this.ClearText = this.ClearText.bind(this)
    this.DisplayLoading = this.DisplayLoading.bind(this)
    this.Update = this.Update.bind(this)
    this.timer = 0

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.no_glow = true
    this.scene.background = new THREE.Color(0xa4d5f5)
    // @clearColor = 0xa4d5f5
    // @clearOpacity = 0

    this.bloomParams = { strength: 1.0, strengthIncrease: 0, kernelSize: 5.0, sigma: 1.0, resolution: 512 }
    this.noiseAmount = 0.0
    this.blendStrength = 1.0

    this.ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(this.ambientLight)

    // @skyBox = @SkyBox()
    // @scene.add(@skyBox)

    // @renderer.setClearColor(0xa4d5f5);

    this.InitializeCanvas()
    this.DrawHeaderLogo()
    // @DrawHeaderText()
    // @DrawTestRect()

    this.textFlashing = true
    this.flashingTextOn = false
    this.firstFrame = false

    this.showChannelNum = false
    this.showCornerLogo = false

    this.camera.position.z = 300
  }

  InitializeCanvas () {
    this.canvas1 = document.createElement('canvas')
    this.canvas1.width = 600
    this.canvas1.height = 600
    this.context1 = this.canvas1.getContext('2d')
    this.context1.font = '40px DolphinOceanWave'
    this.context1.fillText('blah blah blah', -200, -200) // hack to pre-initialize font

    // @context1.textAlign = "left"
    this.context1.textBaseline = 'top'
    this.context1.fillStyle = 'rgba(255,255,255,0.95)'
    this.context1.strokeStyle = 'white'
    this.context1.lineWidth = 2

    this.texture1 = new THREE.Texture(this.canvas1)
    this.texture1.minFilter = THREE.LinearFilter
    this.texture1.magFilter = THREE.LinearFilter
    this.texture1.needsUpdate = true
    this.material1 = new THREE.MeshBasicMaterial({map: this.texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), this.material1)
    this.mesh1.position.set(0, -150, 0)
    return this.scene.add(this.mesh1)
  }

  DrawTestRect () {
    this.context1.fillRect(0, 0, 540, 180)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawHeaderLogo () {
    const img = document.getElementById('logo_header')

    const onImageLoad = () => {
      return this.context1.drawImage(img, 0, 0)
    }

    if (img.complete) {
      onImageLoad(img)
    } else {
      img.onload = onImageLoad
    }

    // img = document.getElementById("logo")
    // @context1.drawImage(img, 0, 0)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawHeaderText () {
    this.ClearHeaderText()

    this.context1.textAlign = 'center'
    this.context1.font = '30px TelegramaRaw'
    this.context1.fillText('vapor.fm', 280, 0)
    this.context1.font = '20px TelegramaRaw'
    this.context1.fillText('evan hemsley', 280, 35)

    this.context1.font = '14px TelegramaRaw'
    this.context1.fillText(`Channel: ${String.fromCharCode(8592)} or ${String.fromCharCode(8594)}`,
      280, 60)
    this.context1.fillText(`Volume: ${String.fromCharCode(8593)} or ${String.fromCharCode(8595)}`,
      280, 80)
    this.context1.fillText('Pause/Play: Space', 280, 100)
    this.context1.fillText('Shuffle Mode: S', 280, 120)
    this.context1.fillText('History: Click Bottom Left', 280, 140)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawFlashingText () {
    this.ClearFlashingText()
    this.context1.textAlign = 'center'
    this.context1.strokeStyle = 'black'
    this.context1.strokeText('Press any key to begin', 300, 200)

    this.context1.fillText('Press any key to begin', 300, 200)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawLoadingText () {
    this.context1.textAlign = 'center'
    this.context1.strokeStyle = 'black'
    this.context1.strokeText('Loading', 300, 200)

    this.context1.fillText('Loading', 300, 200)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  ClearHeaderText () {
    this.ClearText(0, 0, 540, 158)
  }

  ClearFlashingText () {
    this.ClearText(0, 195, 540, 250)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  ClearText (left, top, right, bottom) {
    this.context1.clearRect(left, top, right, bottom)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000)
    const material = new THREE.MeshBasicMaterial({color: 0xa4d5f5, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  DisplayLoading () {
    this.ClearFlashingText()
    this.DrawLoadingText()
    this.textFlashing = false
  }

  Update (deltaTime) {
    if (deltaTime != null) { this.timer += deltaTime }

    if (this.textFlashing) {
      if (this.flashingTextOn) {
        if (this.timer > 1) {
          this.ClearFlashingText()
          this.flashingTextOn = false
          this.timer = 0
        }
      } else {
        if (this.timer > 1) {
          this.DrawFlashingText()
          this.flashingTextOn = true
          this.timer = 0
        }
      }
    }
  }

  // @DrawHeaderText()

  Activate () {
  }

  Render () {
  }

  HandleKeyDownInput (keyCode) {
  }

  HandleKeyUpInput (keyCode) {
  }
}
