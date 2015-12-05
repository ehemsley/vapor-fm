class @Page
  constructor: ->
    @audioInitializer = new AudioInitializer()

    @renderController = new RenderController(@audioInitializer)
    window.addEventListener('resize', @renderController.OnResize, false)
    window.addEventListener('audioLoaded', @renderController.AudioLoadedHandler, false)
    @renderController.Render()

    @paused = false

    document.onkeydown = @CheckKey
    document.onkeyup = @CheckKeyUp

  IncreaseVolume: =>
    @audioInitializer.audioElement.volume = Math.min(Math.max(@audioInitializer.audioElement.volume + 0.1, 0), 1)
    @renderController.UpdateVolumeDisplay(@audioInitializer.audioElement.volume * 10)

    return

  DecreaseVolume: =>
    @audioInitializer.audioElement.volume = Math.min(Math.max(@audioInitializer.audioElement.volume - 0.1, 0), 1)
    @renderController.UpdateVolumeDisplay(@audioInitializer.audioElement.volume * 10)

    return

  TogglePause: =>
    if @paused
      @audioInitializer.LoadAndPlayAudio()
    else
      @audioInitializer.StopAndUnloadAudio()
      @renderController.Pause()

    @paused = !@paused

    return

  CheckKey: (e) =>
    e = e || window.event

    if (e.keyCode == 38) #uparrow
      @IncreaseVolume()
    else if (e.keyCode == 40) #downarrow
      @DecreaseVolume()
    else if (e.keyCode == 32) #spacebar
      @TogglePause()
    else if (e.keyCode == 39) #rightarrow
      @renderController.NextVisualizer() if @audioInitializer.loaded
    else if (e.keyCode == 37) #leftarrow
      @renderController.PreviousVisualizer() if @audioInitializer.loaded
    else if (e.keyCode == 73) #i
      @renderController.ShowInfo()
    else
      @renderController.RouteKeyDownInput(e.keyCode)
    return

  CheckKeyUp: (e) =>
    e = e || window.event
    @renderController.RouteKeyUpInput(e.keyCode)

    return

$ ->
  new Page
