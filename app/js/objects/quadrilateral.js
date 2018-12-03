const THREE = require('three')

module.exports = class Quadrilateral {
  constructor (mystifyQuadrilateral, vertices, velocities, bounds) {
    this.Update = this.Update.bind(this)
    this.ChangeColor = this.ChangeColor.bind(this)
    this.SetXVelocityOfVertex = this.SetXVelocityOfVertex.bind(this)
    this.SetYVelocityOfVertex = this.SetYVelocityOfVertex.bind(this)
    this.VelocityByIndex = this.VelocityByIndex.bind(this)
    this.mystifyQuadrilateral = mystifyQuadrilateral

    this.vertexOnePosition = vertices[0]
    this.vertexTwoPosition = vertices[1]
    this.vertexThreePosition = vertices[2]
    this.vertexFourPosition = vertices[3]

    this.vertexOneVelocity = velocities[0]
    this.vertexTwoVelocity = velocities[1]
    this.vertexThreeVelocity = velocities[2]
    this.vertexFourVelocity = velocities[3]

    this.leftBound = bounds[0]
    this.rightBound = bounds[1]
    this.topBound = bounds[2]
    this.bottomBound = bounds[3]

    const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, opacity: 0.1, transparent: true})
    const lineGeometry = new THREE.Geometry()

    lineGeometry.vertices.push(this.vertexOnePosition)
    lineGeometry.vertices.push(this.vertexTwoPosition)
    lineGeometry.vertices.push(this.vertexThreePosition)
    lineGeometry.vertices.push(this.vertexFourPosition)
    lineGeometry.vertices.push(this.vertexOnePosition)

    this.line = new THREE.Line(lineGeometry, lineMaterial)
  }

  Update (deltaTime) {
    this.vertexOnePosition = this.vertexOnePosition.add(new THREE.Vector3(this.vertexOneVelocity.x,
      this.vertexOneVelocity.y,
      this.vertexOneVelocity.z))

    this.vertexTwoPosition = this.vertexTwoPosition.add(new THREE.Vector3(this.vertexTwoVelocity.x,
      this.vertexTwoVelocity.y,
      this.vertexTwoVelocity.z))

    this.vertexThreePosition = this.vertexThreePosition.add(new THREE.Vector3(this.vertexThreeVelocity.x,
      this.vertexThreeVelocity.y,
      this.vertexThreeVelocity.z))

    this.vertexFourPosition = this.vertexFourPosition.add(new THREE.Vector3(this.vertexFourVelocity.x,
      this.vertexFourVelocity.y,
      this.vertexFourVelocity.z))

    this.CheckBoundsAndAdjustVelocity(this.vertexOnePosition, this.vertexOneVelocity, 0)
    this.CheckBoundsAndAdjustVelocity(this.vertexTwoPosition, this.vertexTwoVelocity, 1)
    this.CheckBoundsAndAdjustVelocity(this.vertexThreePosition, this.vertexThreeVelocity, 2)
    this.CheckBoundsAndAdjustVelocity(this.vertexFourPosition, this.vertexFourVelocity, 3)

    this.line.geometry.verticesNeedUpdate = true
  }

  CheckBoundsAndAdjustVelocity (vertexPosition, vertexVelocity, vertexIndex) {
    let xCollision = false
    let yCollision = false

    if (vertexPosition.x < this.leftBound) {
      vertexPosition.setX(this.leftBound)
      xCollision = true
    } else if (vertexPosition.x > this.rightBound) {
      vertexPosition.setX(this.rightBound)
      xCollision = true
    }

    if (vertexPosition.y < this.bottomBound) {
      vertexPosition.setY(this.bottomBound)
      yCollision = true
    } else if (vertexPosition.y > this.topBound) {
      vertexPosition.setY(this.topBound)
      yCollision = true
    }

    if (xCollision || yCollision) {
      if (this.mystifyQuadrilateral.IsLastVertexToCollide(this, vertexIndex)) {
        if (xCollision) {
          const newXVelocity = this.RandomVelocityComponent(vertexVelocity.x)
          this.mystifyQuadrilateral.FireQuadrilateralsInXDirection(vertexIndex, newXVelocity)
          this.mystifyQuadrilateral.FireQuadrilateralsInYDirection(vertexIndex, vertexVelocity.y)
        }
        if (yCollision) {
          const newYVelocity = this.RandomVelocityComponent(vertexVelocity.y)
          this.mystifyQuadrilateral.FireQuadrilateralsInYDirection(vertexIndex, newYVelocity)
          this.mystifyQuadrilateral.FireQuadrilateralsInXDirection(vertexIndex, vertexVelocity.x)
        }
      }

      vertexVelocity.set(0, 0, 0)
    }
  }

  ChangeColor (newColor) {
    this.line.material.color.setHex(newColor)
    this.line.material.needsUpdate = true
  }

  RandomVelocityComponent (originalVelocity) {
    if (originalVelocity > 0) {
      return Math.min(Math.random() * -5, -0.1)
    } else {
      return Math.max(Math.random() * 5, 0.1)
    }
  }

  SetXVelocityOfVertex (index, newXVelocity) {
    if (index === 0) {
      this.vertexOneVelocity.setX(newXVelocity)
    } else if (index === 1) {
      this.vertexTwoVelocity.setX(newXVelocity)
    } else if (index === 2) {
      this.vertexThreeVelocity.setX(newXVelocity)
    } else if (index === 3) {
      this.vertexFourVelocity.setX(newXVelocity)
    }
  }

  SetYVelocityOfVertex (index, newYVelocity) {
    if (index === 0) {
      this.vertexOneVelocity.setY(newYVelocity)
    } else if (index === 1) {
      this.vertexTwoVelocity.setY(newYVelocity)
    } else if (index === 2) {
      this.vertexThreeVelocity.setY(newYVelocity)
    } else if (index === 3) {
      this.vertexFourVelocity.setY(newYVelocity)
    }
  }

  VelocityByIndex (index) {
    if (index === 0) {
      return this.vertexOneVelocity
    } else if (index === 1) {
      return this.vertexTwoVelocity
    } else if (index === 2) {
      return this.vertexThreeVelocity
    } else if (index === 3) {
      return this.vertexFourVelocity
    }
  }
}
