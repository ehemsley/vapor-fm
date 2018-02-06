const THREE = require('three')
const Visualizer = require('js/visualizer')

module.exports = class CybergridVisualizer extends Visualizer {
  constructor (audioInitializer) {
    super(audioInitializer,
      { strength: 3, strengthIncrease: 1, kernelSize: 12, sigma: 2.0, resolution: 512 },
      0.1,
      2.0,
      true
    )

    this.Update = this.Update.bind(this)

    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(this.ambientLight)

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100)
    this.pointLight.position.set(10, 20, 20)
    this.scene.add(this.pointLight)

    this.skyBox = this.SkyBox()
    this.scene.add(this.skyBox)

    this.gridLines = this.GridLines(-60, -60, 60, 60, 3)
    for (let line of Array.from(this.gridLines)) {
      this.scene.add(line)
    }

    this.sun = this.Sun()
    this.scene.add(this.sun)
    this.sun.position.set(0, 5, -50)

    this.yRotationDirection = 1

    this.camera.position.y = 5
    this.camera.position.z = 20
  }

  SkyBox () {
    const geometry = new THREE.BoxGeometry(500, 500, 500)
    const material = new THREE.MeshBasicMaterial({color: 0x040404, side: THREE.BackSide})
    const skybox = new THREE.Mesh(geometry, material)
    return skybox
  }

  GridLines (leftX, bottomY, rightX, topY, spacing) {
    let line, lineGeometry, lineMaterial, x, y
    let asc, end, step
    let asc1, end1, step1
    let asc2, end2, step2
    let asc3, end3, step3
    const lines = []

    // bottom
    // horizontal lines
    for (y = bottomY, end = topY, step = spacing, asc = step > 0; asc ? y <= end : y >= end; y += step) {
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(leftX, 0, y))
      lineGeometry.vertices.push(new THREE.Vector3(rightX, 0, y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    }

    // vertical lines
    for (x = leftX, end1 = rightX, step1 = spacing, asc1 = step1 > 0; asc1 ? x <= end1 : x >= end1; x += step1) {
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(x, 0, bottomY))
      lineGeometry.vertices.push(new THREE.Vector3(x, 0, topY))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    }

    // top
    // horizontal lines
    for (y = bottomY, end2 = topY, step2 = spacing, asc2 = step2 > 0; asc2 ? y <= end2 : y >= end2; y += step2) {
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(leftX, 10, y))
      lineGeometry.vertices.push(new THREE.Vector3(rightX, 10, y))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    }

    // vertical lines
    for (x = leftX, end3 = rightX, step3 = spacing, asc3 = step3 > 0; asc3 ? x <= end3 : x >= end3; x += step3) {
      lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff, opacity: 0.8, transparent: true})
      lineGeometry = new THREE.Geometry()
      lineGeometry.vertices.push(new THREE.Vector3(x, 10, bottomY))
      lineGeometry.vertices.push(new THREE.Vector3(x, 10, topY))
      line = new THREE.Line(lineGeometry, lineMaterial)
      lines.push(line)
    }

    return lines
  }

  Sun () {
    const geometry = new THREE.CylinderGeometry(0, 5.5, 6, 4, false)
    const material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 1.0, transparent: true})
    const sun = new THREE.Mesh(geometry, material)
    return sun
  }

  Update (deltaTime) {
    if (deltaTime != null) {
      this.timer += deltaTime
      this.sun.rotation.y += deltaTime * this.yRotationDirection
    }

    for (let line of Array.from(this.gridLines)) {
      if (line.material.opacity > 0.5) {
        line.material.opacity = Math.max(line.material.opacity - 0.01, 0.5)
        line.material.needsUpdate = true
      }
    }

    if (this.audioInitializer.beatdetect.isSnare()) {
      for (let i = 0; i <= 29; i++) {
        const randomLine = this.gridLines[this.RandomInt(0, this.gridLines.length - 1)]
        randomLine.material.opacity = 1.0

        randomLine.material.needsUpdate = true
      }
    }

    if (this.audioInitializer.beatdetect.isKick()) {
      this.yRotationDirection = Math.random() < 0.5 ? -1 : 1
      this.sun.scale.set(1.2, 1.2, 1.2)
    } else {
      this.sun.scale.x = Math.max(this.sun.scale.x - 0.01, 1)
      this.sun.scale.y = Math.max(this.sun.scale.y - 0.01, 1)
      this.sun.scale.z = Math.max(this.sun.scale.z - 0.01, 1)
    }
  }
}
