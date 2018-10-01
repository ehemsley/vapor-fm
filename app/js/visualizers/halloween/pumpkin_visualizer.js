const THREE = require('three')
const BustVisualizer = require('js/visualizers/bust_visualizer')

module.exports = class PumpkinVisualizer extends BustVisualizer {
    constructor (audioInitializer) {
        super(audioInitializer)

        this.scaleValue = 1.3
        console.log(this.scaleValue)
    }

    RomanBust () {
        this.bustMinScale = 1.25
        var jackMaterial = new THREE.MeshPhongMaterial({color: 0xFF9100})
        var loader = new THREE.OBJLoader
        loader.load('models/badjack.obj', object => {
            object.traverse(child => {
                if (child instanceof THREE.Mesh) { 
                    child.material = jackMaterial
                }
            })

            object.scale.set(this.bustMinScale, this.bustMinScale, this.bustMinScale);
            object.position.set(0, -1.75, 0)

            this.bust = object
            this.scene.add(this.bust)
        })
    }

    SkyBox () {
        var geometry = new THREE.BoxGeometry(500, 500, 500)
        var material = new THREE.MeshBasicMaterial({color: 0x1f0e19, side: THREE.BackSide})
        var skybox = new THREE.Mesh(geometry, material)
        return skybox
    }
}
