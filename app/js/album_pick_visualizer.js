/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const Visualizer = require('js/visualizer')
const THREE = require('three')

function submit (url, loadCallback, errorCallback) {
  let xmlHttp = new XMLHttpRequest()
  xmlHttp.timeout = 2000
  xmlHttp.ontimeout = function () {
    errorCallback('Request timed out.<br>Check your internet connection.')
  }
  xmlHttp.onerror = function () {
    errorCallback(xmlHttp.status)
  }
  xmlHttp.onload = function () {
    loadCallback(JSON.parse(xmlHttp.responseText))
  }
  xmlHttp.open('GET', url, true)
  xmlHttp.send(null)
}

module.exports = class AlbumPickVisualizer extends Visualizer {
  constructor (audioInitializer) {
    super(
      audioInitializer,
      { strength: 1, strengthIncrease: 0, kernelSize: 12, sigma: 1.5, resolution: 512 },
      0.2,
      0.0,
      false
    )

    this.InitializeCanvas = this.InitializeCanvas.bind(this)
    this.InitializeAlbumPickText = this.InitializeAlbumPickText.bind(this)
    this.DrawHeaderText = this.DrawHeaderText.bind(this)
    this.ClearHeaderText = this.ClearHeaderText.bind(this)
    this.DrawAlbumText = this.DrawAlbumText.bind(this)
    this.ClearAlbumText = this.ClearAlbumText.bind(this)
    this.DrawCongratulatoryText = this.DrawCongratulatoryText.bind(this)
    this.ClearCongratulatoryText = this.ClearCongratulatoryText.bind(this)
    this.DrawFirstDot = this.DrawFirstDot.bind(this)
    this.DrawSecondDot = this.DrawSecondDot.bind(this)
    this.DrawThirdDot = this.DrawThirdDot.bind(this)
    this.Activate = this.Activate.bind(this)
    this.Update = this.Update.bind(this)

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(this.ambientLight)

    this.skyBox = this.SkyBox()
    this.scene.add(this.skyBox)

    this.InitializeAlbumPickText()

    this.InitializeCanvas()
    this.DrawHeaderText()

    this.textFlashing = false
    this.flashingTextOn = false

    this.albumDisplayTimer = 0

    this.camera.position.z = 40
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(500, 500, 500)
    const material = new THREE.MeshBasicMaterial({color: 0x4d004d, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  InitializeCanvas () {
    this.canvas1 = document.createElement('canvas')
    this.canvas1.width = 540
    this.canvas1.height = 180
    this.context1 = this.canvas1.getContext('2d')
    this.context1.font = '30px TelegramaRaw'
    this.context1.textBaseline = 'top'
    this.context1.fillStyle = 'rgba(255, 255, 255, 0.95)'
    this.context1.strokeStyle = 'white'
    this.context1.lineWidth = 2

    this.texture1 = new THREE.Texture(this.canvas1)
    this.texture1.minFilter = THREE.LinearFilter
    this.texture1.magFilter = THREE.LinearFilter
    this.texture1.needsUpdate = true
    this.material1 = new THREE.MeshBasicMaterial({map: this.texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(180, 60), this.material1)
    this.mesh1.position.set(-4, 0, 0)
    this.scene.add(this.mesh1)
  }

  InitializeAlbumPickText () {
    submit(
      'http://vapor.fm/album_pick.txt',
      (response) => {
        const albumPickValues = response.data.split(' - ')
        this.albumPickArtist = albumPickValues[0]
        this.albumPick = albumPickValues[1]
      },
      (errorCode) => {
        let error = `error: ${errorCode}`
        console.log(error)
      }
    )
  }

  DrawHeaderText () {
    this.ClearHeaderText()
    this.context1.textAlign = 'center'
    this.context1.font = '20px TelegramaRaw'
    this.context1.fillText('vapor fm', 280, 0)

    this.context1.font = '14px TelegramaRaw'
    this.context1.fillText('album pick', 280, 25)
    this.context1.fillText('of the month is', 280, 40)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  ClearHeaderText () {
    this.context1.clearRect(0, 0, 540, 60)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawAlbumText () {
    this.ClearAlbumText()
    this.context1.textAlign = 'center'
    this.context1.font = '14px TelegramaRaw'
    this.context1.fillText(this.albumPick, 280, 65)
    this.context1.font = '12px TelegramaRaw'
    this.context1.fillText('by', 280, 82)
    this.context1.fillText(this.albumPickArtist, 280, 100)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  ClearAlbumText () {
    this.context1.clearRect(0, 65, 540, 50)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawCongratulatoryText () {
    this.ClearCongratulatoryText()
    this.context1.font = '15px TelegramaRaw'
    this.context1.fillText('おめでとうございます', 280, 130)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  ClearCongratulatoryText () {
    this.context1.clearRect(0, 130, 540, 20)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawFirstDot () {
    this.context1.fillText('.', 360, 40)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawSecondDot () {
    this.context1.fillText('.', 368, 40)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  DrawThirdDot () {
    this.context1.fillText('.', 376, 40)

    this.mesh1.material.map.needsUpdate = true
    this.mesh1.material.needsUpdate = true
  }

  Activate () {
    this.ClearAlbumText()
    this.ClearCongratulatoryText()

    this.timer = 0
    this.albumDisplayTimer = 0

    this.textFlashing = false
    this.flashingTextOn = false
  }

  Update (deltaTime) {
    if (deltaTime != null) {
      this.albumDisplayTimer += deltaTime
      if (this.textFlashing) { this.timer += deltaTime }
    }

    this.DrawHeaderText()

    if (this.albumDisplayTimer > 1) {
      this.DrawFirstDot()
    }
    if (this.albumDisplayTimer > 2) {
      this.DrawSecondDot()
    }
    if (this.albumDisplayTimer > 3) {
      this.DrawThirdDot()
    }

    if (this.albumDisplayTimer > 4) {
      this.DrawAlbumText()
      this.textFlashing = true
    }

    if (this.textFlashing) {
      if (this.flashingTextOn) {
        if (this.timer > 1) {
          this.ClearCongratulatoryText()
          this.flashingTextOn = false
          this.timer = 0
        }
      } else {
        if (this.timer > 1) {
          this.DrawCongratulatoryText()
          this.flashingTextOn = true
          this.timer = 0
        }
      }
    }
  }
}
