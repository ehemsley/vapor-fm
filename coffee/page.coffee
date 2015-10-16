class @Page
  constructor: ->
    @audioInitializer = new AudioInitializer()

    @renderController = new RenderController(@audioInitializer)
    window.addEventListener('resize', @renderController.OnResize, false)
    @renderController.Render()

    document.onkeydown = @CheckKey

  IncreaseVolume: =>
    @audioInitializer.audioElement.volume += 0.1
    @renderController.UpdateVolumeDisplay(@audioInitializer.audioElement.volume * 10)

    return

  DecreaseVolume: =>
    @audioInitializer.audioElement.volume -= 0.1
    @renderController.UpdateVolumeDisplay(@audioInitializer.audioElement.volume * 10)

    return

  CheckKey: (e) =>
    e = e || window.event

    if (e.keyCode == 38)
      console.log('up')
      @IncreaseVolume()
    else if (e.keyCode == 40)
      @DecreaseVolume()

    return

$ ->
  new Page
