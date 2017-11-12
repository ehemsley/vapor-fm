const THREE = require('three')
const Quadrilateral = require('js/quadrilateral')

module.exports = class MystifyQuadrilateral {
  constructor (leftBound, rightBound, topBound, bottomBound) {
    this.Quadrilaterals = this.Quadrilaterals.bind(this)
    this.Update = this.Update.bind(this)
    this.ChangeColors = this.ChangeColors.bind(this)
    this.IsLastVertexToCollide = this.IsLastVertexToCollide.bind(this)
    this.FireQuadrilateralsInXDirection = this.FireQuadrilateralsInXDirection.bind(this)
    this.FireQuadrilateralsInYDirection = this.FireQuadrilateralsInYDirection.bind(this)
    const width = Math.abs(leftBound - rightBound)
    const height = Math.abs(topBound - bottomBound)

    this.vertexOnePosition = new THREE.Vector3((Math.random() * width * 0.5) - (width * 0.25), height * 0.5, -10)
    this.vertexTwoPosition = new THREE.Vector3(width * -0.5, (Math.random() * height * 0.5) - (height * 0.25), -10)
    this.vertexThreePosition = new THREE.Vector3((Math.random() * width * 0.5) - (width * 0.25), height * -0.5, -10)
    this.vertexFourPosition = new THREE.Vector3(width * 0.5, (Math.random() * height * 0.5) - (height * 0.25), -10)

    this.vertexOneVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) - 1, 0)
    this.vertexTwoVelocity = new THREE.Vector3((Math.random() * 1) + 1, (Math.random() * 2) - 1, 0)
    this.vertexThreeVelocity = new THREE.Vector3((Math.random() * 2) - 1, (Math.random() * 1) + 1, 0)
    this.vertexFourVelocity = new THREE.Vector3((Math.random() * 1) - 1, (Math.random() * 2) - 1, 0)

    this.leftBound = leftBound
    this.rightBound = rightBound
    this.topBound = topBound
    this.bottomBound = bottomBound

    this.quadrilaterals = this.Quadrilaterals(6)

    this.nextCollisionXVelocity = ([0, 1, 2, 3].map((i) => 0))
    this.nextCollisionYVelocity = ([0, 1, 2, 3].map((j) => 0))

    this.timer = 0
    this.colorChangeTime = this.RandomColorChangeTime()

    this.ChangeColors()
  }

  Quadrilaterals (num) {
    const quadrilaterals = []
    const vertices = []
    const bounds = [this.leftBound, this.rightBound, this.topBound, this.bottomBound]

    const vertexOneDirection = this.vertexOneVelocity.clone().normalize()
    const vertexTwoDirection = this.vertexTwoVelocity.clone().normalize()
    const vertexThreeDirection = this.vertexThreeVelocity.clone().normalize()
    const vertexFourDirection = this.vertexFourVelocity.clone().normalize()

    for (let i = 0; i < num; i++) {
      vertices[0] = this.vertexOnePosition.clone().add(vertexOneDirection.clone().multiplyScalar(i * 20))
      vertices[1] = this.vertexTwoPosition.clone().add(vertexTwoDirection.clone().multiplyScalar(i * 20))
      vertices[2] = this.vertexThreePosition.clone().add(vertexThreeDirection.clone().multiplyScalar(i * 20))
      vertices[3] = this.vertexFourPosition.clone().add(vertexFourDirection.clone().multiplyScalar(i * 20))

      const velocities = [this.vertexOneVelocity.clone(),
        this.vertexTwoVelocity.clone(),
        this.vertexThreeVelocity.clone(),
        this.vertexFourVelocity.clone()]

      const quadrilateral = new Quadrilateral(this, vertices, velocities, bounds)
      quadrilaterals.push(quadrilateral)
    }

    return quadrilaterals
  }

  Update (deltaTime) {
    this.timer += deltaTime

    if (this.timer > this.colorChangeTime) {
      this.timer = 0
      this.colorChangeTime = this.RandomColorChangeTime()
      this.ChangeColors()
    }

    for (let quadrilateral of Array.from(this.quadrilaterals)) {
      quadrilateral.Update(deltaTime)
    }
  }

  RandomColorChangeTime () {
    return Math.random() * 30
  }

  SetColorChangeTimeout (quadrilateral, i, newColor) {
    setTimeout(() => quadrilateral.ChangeColor(newColor)
      , i * 100)
  }

  ChangeColors () {
    const newColor = Math.random() * 0xffffff
    return Array.from(this.quadrilaterals).map((quadrilateral, i) =>
      this.SetColorChangeTimeout(quadrilateral, i, newColor))
  }

  IsLastVertexToCollide (currentQuadrilateral, vertexIndex) {
    for (let iteratedQuadrilateral of Array.from(this.quadrilaterals)) {
      if (currentQuadrilateral !== iteratedQuadrilateral) {
        if (iteratedQuadrilateral.VelocityByIndex(vertexIndex).length() !== 0) {
          return false
        }
      }
    }

    return true
  }

  FireQuadrilateralsInXDirection (vertexIndex, newXVelocity) {
    const iterable = this.quadrilaterals.slice()
    for (let i = iterable.length - 1; i >= 0; i--) {
    // for quadrilateral, i in @quadrilaterals
      const quadrilateral = iterable[i]
      this.SetQuadrilateralFireInXDirectionTimeout(quadrilateral, i, vertexIndex, newXVelocity)
    }
  }

  FireQuadrilateralsInYDirection (vertexIndex, newYVelocity) {
    const iterable = this.quadrilaterals.slice()
    for (let i = iterable.length - 1; i >= 0; i--) {
    // for quadrilateral, i in @quadrilaterals
      const quadrilateral = iterable[i]
      this.SetQuadrilateralFireInYDirectionTimeout(quadrilateral, i, vertexIndex, newYVelocity)
    }
  }

  SetQuadrilateralFireInXDirectionTimeout (quadrilateral, quadIndex, vertexIndex, newXVelocity) {
    setTimeout(() => quadrilateral.SetXVelocityOfVertex(vertexIndex, newXVelocity)
      , quadIndex * 100)
  }

  SetQuadrilateralFireInYDirectionTimeout (quadrilateral, quadIndex, vertexIndex, newYVelocity) {
    setTimeout(() => quadrilateral.SetYVelocityOfVertex(vertexIndex, newYVelocity)
      , quadIndex * 100)
  }
}
