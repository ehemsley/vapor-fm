module.exports = class AudioInitializer
  constructor: ->
    AudioContext = window.AudioContext or window.webkitAudioContext or false
    @context = new AudioContext
    @analyser = @context.createAnalyser()
    @frequencyData = new Uint8Array(@analyser.frequencyBinCount)
    @floats = new Float32Array(@analyser.frequencyBinCount)
    @beatdetect = new FFT.BeatDetect(1024, 44100)
    @fft = new FFT.fft(1024, 44100)

    @audioElement = $('#stream').get(0)
    @AddCanPlayListener()

    @StopAndUnloadAudio()

    # @loadCheckTimeout = setTimeout @CheckLoaded, 8000

  GetAverageVolume: (array) =>
    values = 0
    average = undefined
    i = 0
    while i < array.length
      values += array[i]
      i++
    average = values / array.length
    average

  #have to do a lot of dumb shit because html5 doesnt
  #define a mechanism to stop buffering an element LOL
  StopAndUnloadAudio: =>
    clearTimeout @loadCheckTimeout

    @audioElement.pause()
    @originalSrc = @audioElement.src
    @audioElement.src = 'about:blank'
    @audioElement.load()
    $('#stream').remove()
    $('#audioContainer').append("<audio id='stream' preload='none' crossorigin='anonymous'></audio>")
    @audioElement = $('#stream').get(0)
    @audioElement.src = @originalSrc

    @AddCanPlayListener()

    @loaded = false
    @loading = false

    return

  LoadAndPlayAudio: =>
    @loading = true
    $('#audioContainer audio').attr('preload','auto') #firefox hack, never fires canplay if preload not set to auto
    @audioElement.load()
    clearTimeout @loadCheckTimeout
    @loadCheckTimeout = setTimeout @CheckLoaded, 8000

    return

  CheckLoaded: =>
    if @loading
      @audioElement.load()
      @loadCheckTimeout = setTimeout @CheckLoaded, 8000

    return

  AddCanPlayListener: =>
    audioLoaded = new Event('audioLoaded')
    listener = =>
      window.dispatchEvent(audioLoaded)
      @loaded = true
      @loading = false
      source = @context.createMediaElementSource(@audioElement)
      source.connect(@analyser)
      source.connect(@context.destination)

      sampleRate = @context.sampleRate
      @beatdetect = new FFT.BeatDetect(@analyser.frequencyBinCount, sampleRate)
      @fft = new FFT.fft(@analyser.frequencyBinCount, sampleRate)
      @beatdetect.setSensitivity(500)
      @audioElement.play()
      @audioElement.removeEventListener 'canplay', listener #firefox hack b/c firefox fires canplay a million times for no reason lol
      return

    @audioElement.addEventListener 'canplay', listener

    return
