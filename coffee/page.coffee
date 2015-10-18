class @Page
  constructor: ->
    @audioInitializer = new AudioInitializer()

    @renderController = new RenderController(@audioInitializer)
    window.addEventListener('resize', @renderController.OnResize, false)
    window.addEventListener('audioLoaded', @renderController.AudioLoadedHandler, false)
    @renderController.Render()

    @paused = false

    document.onkeydown = @CheckKey

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

    return

$ ->
  new Page
