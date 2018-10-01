const THREE = require('three')
const HeartVisualizer = require('js/visualizers/heart_visualizer')

module.exports = class HalloweenHeartVisualizer extends HeartVisualizer {
    constructor (audioInitializer) {
        super(audioInitializer)

        this.bloomParams = {
            strength: 1,
            strengthIncrease: 0.5,
            kernelSize: 12,
            sigma: 1.5,
            resolution: 512
        }

        this.minScale = 1
        this.maxScale = 1.1
    }
   
    Hearts (number) {
        this.hearts = []

        var heartMaterial = new THREE.MeshPhongMaterial({color: 0xff9100})
        const loader = new THREE.OBJLoader
        loader.load('models/GoodJack.obj', (object) => {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = heartMaterial
                }
            })

            object.userData = { extraRotation: 0 }
            object.rotation.set(this.RandomFloat(0, Math.PI/4), this.RandomFloat(0, Math.PI/4), 0)
            object.scale.set(this.minScale, this.minScale, this.minScale)

            for (var i = 0; i < number; i++) {
                const newObject = object.clone()
                this.hearts.push(newObject)
                this.scene.add(newObject)
            }

            this.SetHeartsPositions()
        })
    }

    SkyBox () {
        var geometry = new THREE.BoxGeometry(500, 500, 500)
        var material = new THREE.MeshBasicMaterial({color: 0x1f0e19, side: THREE.BackSide})
        var skybox = new THREE.Mesh(geometry, material)
        return skybox
    }
}