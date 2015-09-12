class @AudioInitializer
  constructor: ->
    @context = new AudioContext
    @analyser = @context.createAnalyser()
    @frequencyData = new Uint8Array(@analyser.frequencyBinCount)
    @floats = new Float32Array(@analyser.frequencyBinCount)
    @beatdetect = new FFT.BeatDetect(1024, 44100)

    @audioElement = document.getElementById('stream')

    @audioElement.addEventListener 'canplay', =>
      source = @context.createMediaElementSource(@audioElement)
      source.connect(@analyser)
      source.connect(@context.destination)

      sampleRate = @context.sampleRate
      @beatdetect = new FFT.BeatDetect(@analyser.frequencyBinCount, sampleRate)
      @beatdetect.setSensitivity(500)
      @audioElement.play()
      return

  GetAverageVolume: (array) =>
    values = 0
    average = undefined
    i = 0
    while i < array.length
      values += array[i]
      i++
    average = values / array.length
    average
