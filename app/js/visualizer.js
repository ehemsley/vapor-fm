let Visualizer;
module.exports = (Visualizer = class Visualizer {
  constructor(audioInitializer, bloomParams, noiseAmount, blendStrength, beatDistortionEffect) {
    this.audioInitializer = audioInitializer;
    this.timer = 0;
    this.scene = new THREE.Scene;

    this.bloomParams = bloomParams;
    this.noiseAmount = noiseAmount;
    this.blendStrength = blendStrength;
    this.beatDistortionEffect = beatDistortionEffect;
    this.no_glow = false;
    this.clearColor = 0x000000;
    this.clearOpacity = 0;

    this.showChannelNum = true;
    this.showCornerLogo = true;

  }

  Update(deltaTime) {
  }

  Render() {
  }

  HandleKeyDownInput(keyCode) {
  }

  HandleKeyUpInput(keyCode) {
  }

  Activate() {
  }

  RandomFloat(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  RandomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }
});
