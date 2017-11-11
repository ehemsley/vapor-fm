/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NoiseVisualizer;
const Visualizer = require('js/visualizer');

module.exports = (NoiseVisualizer = class NoiseVisualizer extends Visualizer {
  constructor() {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.scene = new THREE.Scene;
    this.camera = new THREE.OrthographicCamera(window.innerWidth / -2,
                                           window.innerWidth / 2,
                                           window.innerHeight / 2,
                                           window.innerHeight / -2,
                                           0.1,
                                           1000);

    this.noiseAmount = 1.0;

    this.showChannelNum = true;
    this.showCornerLogo = false;

  }
});
