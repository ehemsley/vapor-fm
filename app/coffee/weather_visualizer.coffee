Visualizer = require('coffee/visualizer')

module.exports = class WeatherVisualizer
  constructor: ->
    @scene = new THREE.Scene
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    @no_glow = true
    @scene.background = new THREE.Color(0xa4d5f5)

    @bloomParams = { strength: 1.0, strengthIncrease: 0, kernelSize: 5.0, sigma: 1.0, resolution: 512 }
    @noiseAmount = 0.0
    @blendStrength = 1.0

    @ambientLight = new THREE.AmbientLight(0x404040)
    @scene.add(@ambientLight)

    date = new Date()
    today = date.getDay()
    @next_five_days = new Array(5)
    @next_five_days[0] = @DayNumToText(today)
    @next_five_days[1] = @DayNumToText((today + 1) % 7)
    @next_five_days[2] = @DayNumToText((today + 2) % 7)
    @next_five_days[3] = @DayNumToText((today + 3) % 7)
    @next_five_days[4] = @DayNumToText((today + 4) % 7)

    @InitializeCanvas()
    @DrawDays()
    @DrawForecastRectangles()

    @showChannelNum = true
    @showCornerLogo = true

    @camera.position.z = 300

    return

  InitializeCanvas: =>
    @canvas1 = document.createElement('canvas')
    @canvas1.width = 800
    @canvas1.height = 800

    @context1 = @canvas1.getContext('2d')

    @texture1 = new THREE.Texture(@canvas1)
    @texture1.minFilter = THREE.LinearFilter
    @texture1.magFilter = THREE.LinearFilter
    @texture1.needsUpdate = true
    @material1 = new THREE.MeshBasicMaterial({map: @texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0})
    @mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), @material1)
    @mesh1.position.set(0, -150, 0)
    @scene.add(@mesh1)

    return

  DayNumToText: (dayNum) ->
    if dayNum == 0
      'Sun'
    else if dayNum == 1
      'Mon'
    else if dayNum == 2
      'Tue'
    else if dayNum == 3
      'Wed'
    else if dayNum == 4
      'Thu'
    else if dayNum == 5
      'Fri'
    else if dayNum == 6
      'Sat'

  DrawDays: =>
    @context1.fillStyle = 'rgba(200, 200, 200, 1)'

    @context1.fillRect(50, 100, 100, 50)
    @context1.fillRect(200, 100, 100, 50)
    @context1.fillRect(350, 100, 100, 50)
    @context1.fillRect(500, 100, 100, 50)
    @context1.fillRect(650, 100, 100, 50)

    @context1.fillStyle = 'rgba(0, 0, 0, 1)'
    @context1.font = '30px Arial'
    @context1.textBaseline = 'top'

    @context1.fillText(@next_five_days[0], 50, 100)
    @context1.fillText(@next_five_days[1], 200, 100)
    @context1.fillText(@next_five_days[2], 350, 100)
    @context1.fillText(@next_five_days[3], 500, 100)
    @context1.fillText(@next_five_days[4], 650, 100)

    return

  DrawForecastRectangles: =>
    @context1.fillStyle = 'rgba(50, 25, 210, 0.95)'

    @context1.fillRect(50, 150, 100, 200)
    @context1.fillRect(200, 150, 100, 200)
    @context1.fillRect(350, 150, 100, 200)
    @context1.fillRect(500, 150, 100, 200)
    @context1.fillRect(650, 150, 100, 200)

    @mesh1.material.map.needsUpdate = true
    @mesh1.material.needsUpdate = true

    return

  Update: (deltaTime) =>
    @DrawForecastRectangles()
    return
  
  Activate: ->
    return

  Render: ->
    return

  HandleKeyDownInput: (keyCode) ->
    return

  HandleKeyUpInput: (keyCode) ->
    return
