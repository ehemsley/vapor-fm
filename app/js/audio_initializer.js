module.exports = class AudioInitializer {
  constructor () {
    this.StopAndUnloadAudio = this.StopAndUnloadAudio.bind(this)
    this.LoadAndPlayAudio = this.LoadAndPlayAudio.bind(this)
    this.CheckLoaded = this.CheckLoaded.bind(this)
    this.AddCanPlayListener = this.AddCanPlayListener.bind(this)

    // this.audioElement = $('#stream').get(0)
    this.audioElement = document.getElementById('stream')
    this.AddCanPlayListener()

    this.StopAndUnloadAudio()
  }

  // have to do this because of new google policy lol!!!!!!!!
  InitAudioContext () {
    const AudioContext = window.AudioContext || window.webkitAudioContext || false
    this.context = new AudioContext()
    this.analyser = this.context.createAnalyser()
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
    this.floats = new Float32Array(this.analyser.frequencyBinCount)
    this.beatdetect = new FFT.BeatDetect(1024, 44100)
  }

  GetAverageVolume (array) {
    let values = 0
    let i = 0
    while (i < array.length) {
      values += array[i]
      i++
    }
    return values / array.length
  }

  // have to do a lot of dumb hacks because html5 doesnt
  // define a mechanism to stop buffering an element LOL
  StopAndUnloadAudio () {
    clearTimeout(this.loadCheckTimeout)

    this.audioElement.pause()
    this.originalSrc = this.audioElement.src
    this.audioElement.src = 'about:blank'
    this.audioElement.load()
    this.audioElement.remove()
    this.audioElement = document.createElement('audio')
    this.audioElement.setAttribute('id', 'stream')
    this.audioElement.setAttribute('preload', 'none')
    this.audioElement.setAttribute('crossorigin', 'anonymous')
    document.getElementById('audioContainer').append(this.audioElement)
    this.audioElement = document.getElementById('stream')
    this.audioElement.src = this.originalSrc

    this.AddCanPlayListener()
    this.AddStalledListener()

    this.loaded = false
    this.loading = false
  }

  LoadAndPlayAudio () {
    this.InitAudioContext()
    this.loading = true
    this.audioElement.setAttribute('preload', 'auto') // firefox hack, never fires canplay if preload not set to auto
    this.audioElement.load()
    clearTimeout(this.loadCheckTimeout)
    this.loadCheckTimeout = setTimeout(this.CheckLoaded, 8000)
  }

  CheckLoaded () {
    if (this.loading) {
      this.audioElement.load()
      this.loadCheckTimeout = setTimeout(this.CheckLoaded, 8000)
    }
  }

  AddCanPlayListener () {
    const audioLoaded = new Event('audioLoaded')
    var listener = () => {
      window.dispatchEvent(audioLoaded)
      this.loaded = true
      this.loading = false
      const source = this.context.createMediaElementSource(this.audioElement)
      source.connect(this.analyser)
      source.connect(this.context.destination)

      const { sampleRate } = this.context
      this.beatdetect = new FFT.BeatDetect(this.analyser.frequencyBinCount, sampleRate)
      // this.fft = new FFT.fft(this.analyser.frequencyBinCount, sampleRate)
      this.beatdetect.setSensitivity(500)
      this.audioElement.play()
      // firefox hack b/c firefox fires canplay event a million times for no reason lol web dev
      this.audioElement.removeEventListener('canplay', listener)
    }

    this.audioElement.addEventListener('canplay', listener)
  }

  AddStalledListener () {
    var listener = () => {
      this.StopAndUnloadAudio()
      this.LoadAndPlayAudio()
    }
    this.audioElement.addEventListener('stalled', listener)
  }
}
