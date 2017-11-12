const AudioInitializer = require('js/audio_initializer')
const RenderController = require('js/render_controller')

module.exports = class {
  constructor () {
    this.IncreaseVolume = this.IncreaseVolume.bind(this)
    this.DecreaseVolume = this.DecreaseVolume.bind(this)
    this.TogglePause = this.TogglePause.bind(this)
    this.CheckKey = this.CheckKey.bind(this)
    this.CheckKeyUp = this.CheckKeyUp.bind(this)
    this.audioInitializer = new AudioInitializer()

    this.renderController = new RenderController(this.audioInitializer)
    window.addEventListener('resize', this.renderController.OnResize, false)
    window.addEventListener('audioLoaded', this.renderController.AudioLoadedHandler, false)
    window.addEventListener('audioStalled', this.renderController.Pause, false)
    this.renderController.Render()

    this.activated = false

    this.paused = false

    this.prePauseVolume = 1

    this.keyCodeMap = new Map()
    this.keyCodeMap.set(38, this.IncreaseVolume) // up arrow
    this.keyCodeMap.set(40, this.DecreaseVolume) // down arrow
    this.keyCodeMap.set(32, this.TogglePause) // spacebar
    this.keyCodeMap.set(39, () => { // right arrow
      if (this.audioInitializer.loaded) { this.renderController.NextVisualizer() }
    })
    this.keyCodeMap.set(37, () => { // left arrow
      if (this.audioInitializer.loaded) { this.renderController.PreviousVisualizer() }
    })
    this.keyCodeMap.set(73, this.renderController.ShowInfo) // i
    this.keyCodeMap.set(83, this.renderController.ToggleShuffle) // s

    document.onkeydown = this.CheckKey
    document.onkeyup = this.CheckKeyUp
  }

  IncreaseVolume () {
    this.audioInitializer.audioElement.volume = Math.min(Math.max(this.audioInitializer.audioElement.volume + 0.1, 0), 1)
    this.renderController.UpdateVolumeDisplay(this.audioInitializer.audioElement.volume * 10)
  }

  DecreaseVolume () {
    this.audioInitializer.audioElement.volume = Math.min(Math.max(this.audioInitializer.audioElement.volume - 0.1, 0), 1)
    this.renderController.UpdateVolumeDisplay(this.audioInitializer.audioElement.volume * 10)
  }

  TogglePause () {
    if (this.paused) {
      this.audioInitializer.LoadAndPlayAudio()
      this.audioInitializer.audioElement.volume = this.prePauseVolume
    } else {
      this.prePauseVolume = this.audioInitializer.audioElement.volume
      this.audioInitializer.StopAndUnloadAudio()
      this.renderController.Pause()
    }

    this.paused = !this.paused
  }

  CheckKey (e) {
    e = e || window.event
    let keyCode = e.keyCode

    if (this.activated) {
      if (this.keyCodeMap.has(keyCode)) {
        this.keyCodeMap.get(keyCode)()
      } else {
        this.renderController.RouteKeyDownInput(keyCode)
      }
    } else {
      this.activated = true
      this.audioInitializer.LoadAndPlayAudio()
      this.renderController.activeVisualizer.DisplayLoading()

      var listener = () => {
        this.renderController.Activate()
        return this.audioInitializer.audioElement.removeEventListener('canplay', listener) // firefox hack
      }

      this.audioInitializer.audioElement.addEventListener('canplay', listener)
    }
  }

  CheckKeyUp (e) {
    e = e || window.event
    this.renderController.RouteKeyUpInput(e.keyCode)
  }
}
