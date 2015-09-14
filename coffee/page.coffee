class @Page
  constructor: ->
    @audioInitializer = new AudioInitializer()
    visualizers = [new Visualizer(@audioInitializer), new HeartVisualizer(@audioInitializer)]

    @renderController = new RenderController(visualizers)
    window.addEventListener('resize', @renderController.OnResize, false)
    @renderController.Render()

    setInterval(@renderController.FadeToNext, 60000)

    playButton = document.getElementById('play-button')
    stopButton = document.getElementById('stop-button')

    playButton.style.visibility = "hidden"

    @speakerHigh = document.getElementById('speaker-high')
    @speakerLow = document.getElementById('speaker-low')
    @speakerNone = document.getElementById('speaker-none')

    @volumeBar = document.getElementById('volume-bar')

    @volumeBar.value = 1.0
    previousVolume = 1.0

    @volumeBar.addEventListener('input', @UpdateVolume)

    stopButton.onclick = =>
      @audioInitializer.audioElement.pause()
      stopButton.style.visibility = "hidden"
      playButton.style.visibility = "visible"
      return

    playButton.onclick = =>
      @audioInitializer.audioElement.load()
      @audioInitializer.audioElement.play()
      playButton.style.visibility = "hidden"
      stopButton.style.visibility = "visible"
      return

    @speakerHigh.onclick = =>
      previousVolume = @volumeBar.value
      @volumeBar.value = "0"
      @UpdateVolume()
      return

    @speakerLow.onclick = =>
      previousVolume = @volumeBar.value
      @volumeBar.value = "0"
      @UpdateVolume()
      return

    @speakerNone.onclick = =>
      @volumeBar.value = previousVolume
      @UpdateVolume()
      return

  HideAllSpeakers: =>
    @speakerHigh.style.visibility = "hidden"
    @speakerLow.style.visibility = "hidden"
    @speakerNone.style.visibility = "hidden"
    return

  UpdateVolume: =>
    @HideAllSpeakers()
    parsedValue = parseFloat(@volumeBar.value)
    if parsedValue == 0
      @speakerNone.style.visibility = "visible"
    else if (parsedValue > 0 && parsedValue < 0.5)
      @speakerLow.style.visibility = "visible"
    else
      @speakerHigh.style.visibility = "visible"

    @audioInitializer.audioElement.volume = @volumeBar.value
    return

$ ->
  new Page
