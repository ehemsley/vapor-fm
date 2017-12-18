import { Clock } from 'three'

const IcecastHelper = require('js/icecast_helper')
const StringHelper = require('js/string_helper')
const Timer = require('js/timer')

module.exports = class UI {
  constructor () {
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.context = this.canvas.getContext('2d')
    this.context.font = '50px TelegramaRaw'
    this.context.textAlign = 'left'
    this.context.textBaseline = 'top'
    this.context.fillStyle = 'rgba(255,255,255,0.95)'

    this.paused = false

    this.channelDisplayActive = false
    this.channelTimer = new Timer()
    this.channelTimer.setFinishCallback(() => {
      this.clearChannelDisplay()
    })

    this.icecastTimer = new Timer()
    this.icecastTimer.setFinishCallback(() => {
      this.refreshSongData()
      this.icecastTimer.start()
    })

    this.infoDisplayActive = false
    this.infoTimer = new Timer()
    this.infoTimer.setFinishCallback(() => {
      this.clearInfoDisplay()
    })

    this.playStatusActive = false
    this.playStatusTimer = new Timer()
    this.playStatusTimer.setFinishCallback(() => {
      this.clearPlayStatus()
      this.playStatusActive = false
    })

    this.volumeDisplayActive = false
    this.volumeDisplayTimer = new Timer()
    this.volumeDisplayTimer.setFinishCallback(() => {
      this.clearVolumeDisplay()
    })

    this.clock = new Clock()
    this.clock.start()
  }

  update () {
    this.channelTimer.update()
    this.icecastTimer.update()
    this.infoTimer.update()
    this.playStatusTimer.update()
    this.volumeDisplayTimer.update()
  }

  updateText (songData) {
    let fittingArtistName = StringHelper.fittingString(songData.artistName, this.canvas, this.context, 0.8)
    let fittingSongName = StringHelper.fittingString(songData.songName, this.canvas, this.context, 0.8)

    this.drawOverlay(fittingArtistName, fittingSongName)
  }

  refreshSongData () {
    IcecastHelper.getSongData((songData) => {
      this.updateText(songData)
    })
  }

  pause () {
    this.paused = true
  }

  unPause () {
    this.paused = false
  }

  clearCanvasArea (startX, startY, width, height) {
    this.context.clearRect(startX, startY, width, height)
  }

  clearChannelDisplay () {
    this.channelDisplayActive = false
    this.clearCanvasArea(this.canvas.width * 0.65, 0, this.canvas.width, ((this.canvas.height * 0.08) - 50) + 150)
  }

  clearInfoDisplay () {
    this.clearCanvasArea(0, (this.canvas.height * 0.08) - 50, this.canvas.width * 0.75, ((this.canvas.height * 0.4) - 50) + (38 * 1.55))
    this.infoDisplayActive = false
  }

  clearLogo () {
    const minDimension = Math.min(this.canvas.width * 0.12, this.canvas.height * 0.12)
    return this.context.clearRect((this.canvas.width * 0.98) - minDimension,
      (this.canvas.height * 0.98) - minDimension,
      minDimension,
      minDimension)
  }

  clearPlayStatus () {
    this.playStatusActive = false
    this.clearCanvasArea(this.canvas.width * 0.8, 0, this.canvas.width * 0.25, this.canvas.height * 0.25)
  }

  clearVolumeDisplay () {
    this.volumeDisplayActive = false
    this.context.clearRect(0, 0, this.canvas.width / 2, this.canvas.height / 2)
  }

  drawChannelDisplay (channelNum) {
    this.clearChannelDisplay()
    this.clearPlayStatus()

    this.channelDisplayActive = true
    this.channelTimer.start(4)

    if (channelNum === 0) {
      channelNum = 'A/V'
    }

    channelNum = channelNum.toString()

    this.context.save()

    this.context.font = '100px TelegramaRaw'

    for (let i = channelNum.length - 1; i >= 0; i--) {
      this.context.strokeStyle = 'black'
      this.context.strokeText(channelNum[i],
        this.canvas.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
        (this.canvas.height * 0.08) - 50)

      this.context.fillStyle = 'white'
      this.context.fillText(channelNum[i],
        this.canvas.width * (0.9 - ((channelNum.length - 1 - i) * 0.055)),
        (this.canvas.height * 0.08) - 50)
    }

    this.context.restore()
  }

  drawInfo () {
    this.clearVolumeDisplay()

    this.infoDisplayActive = true
    this.infoTimer.start(5)

    this.context.save()
    this.context.font = '38px TelegramaRaw'

    this.context.strokeStyle = 'black'
    this.context.lineWidth = 8
    this.context.strokeText('Created by Evan Hemsley', this.canvas.width * 0.02, (this.canvas.height * 0.08) - 50)
    this.context.strokeText('@thatcosmonaut', this.canvas.width * 0.02, (this.canvas.height * 0.16) - 50)

    this.context.fillStyle = 'white'
    this.context.fillText('Created by Evan Hemsley', this.canvas.width * 0.02, (this.canvas.height * 0.08) - 50)
    this.context.fillText('@thatcosmonaut', this.canvas.width * 0.02, (this.canvas.height * 0.16) - 50)
    this.context.restore()
  }

  drawLogo () {
    this.context.globalAlpha = 0.5
    const img = document.getElementById('logo')
    const minDimension = Math.min(this.canvas.width * 0.12, this.canvas.height * 0.12)
    this.context.drawImage(
      img,
      (this.canvas.width * 0.98) - minDimension,
      (this.canvas.height * 0.98) - minDimension,
      minDimension,
      minDimension
    )
    this.context.globalAlpha = 1.0
  }

  drawPauseIcon () {
    this.clearPlayStatus()

    let startX = this.canvas.width * 0.8
    let startY = 0
    let width = this.canvas.width * 0.25
    let height = this.canvas.height * 0.25

    this.context.save()
    this.context.beginPath()
    this.context.translate(startX + (width * 0.5), startY + (height * 0.5))
    this.context.fillStyle = 'white'
    this.context.fillRect(-width * 0.1, -height * 0.2, width * 0.1, height * 0.4)
    this.context.fillRect(width * 0.1, -height * 0.2, width * 0.1, height * 0.4)
    this.context.restore()

    this.playStatusActive = true
    this.playStatusTimer.start(4)
  }

  drawPlayIcon () {
    this.clearPlayStatus()

    let startX = this.canvas.width * 0.8
    let startY = 0
    let width = this.canvas.width * 0.25
    let height = this.canvas.height * 0.25

    this.context.save()
    this.context.beginPath()
    this.context.translate(startX + (width * 0.5), startY + (height * 0.5))
    this.context.fillStyle = 'white'
    this.context.moveTo(width * 0.2, 0)
    this.context.lineTo(-width * 0.05, Math.min(width, height) * 0.25)
    this.context.lineTo(-width * 0.05, -Math.min(width, height) * 0.25)
    this.context.fill()
    this.context.restore()

    this.playStatusActive = true
    this.playStatusTimer.start(4)
  }

  drawOverlay (artistName, songName) {
    this.context.clearRect(0, this.canvas.height / 2, this.canvas.width * 0.85, this.canvas.height / 2)
    this.context.font = '50px TelegramaRaw'

    this.context.strokeStyle = 'black'
    this.context.lineWidth = 8
    this.context.strokeText(artistName, 10, (this.canvas.height * 0.9) - 50)
    this.context.strokeText(songName, 10, (this.canvas.height * 0.98) - 50)

    this.context.fillStyle = 'white'
    this.context.fillText(artistName, 10, (this.canvas.height * 0.9) - 50)
    this.context.fillText(songName, 10, (this.canvas.height * 0.98) - 50)
  }

  drawShuffleText (enabled) {
    this.clearVolumeDisplay()

    this.context.font = '60px TelegramaRaw'
    this.context.fillStyle = 'white'
    this.context.strokeStyle = 'black'

    if (enabled) {
      this.context.strokeText('Shuffle: On', 10, 10)
      this.context.fillText('Shuffle: On', 10, 10)
    } else {
      this.context.strokeText('Shuffle: Off', 10, 10)
      this.context.fillText('Shuffle: Off', 10, 10)
    }
  }

  drawSpinner () {
    let startX = this.canvas.width * 0.8
    let startY = 0
    let width = this.canvas.width * 0.25
    let height = this.canvas.height * 0.25

    const lines = 16
    const rotation = parseInt(this.clock.getElapsedTime() * lines) / lines
    this.context.save()
    this.context.translate(startX + (width * 0.5), startY + (height * 0.5))
    this.context.rotate(Math.PI * 2 * rotation)
    for (let i = 0, end = lines - 1, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
      this.context.beginPath()
      this.context.rotate((Math.PI * 2) / lines)
      this.context.moveTo(Math.min(width, height) / 10, 0)
      this.context.lineTo(Math.min(width, height) / 4, 0)
      this.context.lineWidth = Math.min(width, height) / 30
      this.context.strokeStyle = `rgba(255,255,255,${i / lines})`
      this.context.stroke()
    }
    this.context.restore()
  }

  drawVolumeDisplay (filledBarAmount) {
    this.clearVolumeDisplay()
    this.clearInfoDisplay()

    this.volumeDisplayActive = true
    this.volumeDisplayTimer.start(4)

    filledBarAmount = Math.min(Math.round(filledBarAmount), 10)

    const rectangleStartX = 10
    const rectangleStartY = 70

    const volumeBarWidth = Math.round(this.canvas.width * 0.02)
    const volumeBarHeight = Math.round(this.canvas.height * 0.1)

    let xOffset = 0

    this.context.font = '60px TelegramaRaw'
    this.context.fillStyle = 'green'
    this.context.fillText('Volume', 10, 0)

    let i = 0
    while (i < filledBarAmount) {
      this.context.fillRect(rectangleStartX + xOffset + (i * volumeBarWidth),
        rectangleStartY,
        volumeBarWidth,
        volumeBarHeight)
      xOffset += volumeBarWidth * 0.5
      i += 1
    }

    i = filledBarAmount
    while (i < 10) {
      this.context.fillRect(rectangleStartX + xOffset + (i * volumeBarWidth),
        (rectangleStartY + (volumeBarHeight * 0.5)) - (volumeBarHeight * 0.1),
        volumeBarWidth,
        volumeBarHeight * 0.1)
      xOffset += volumeBarWidth * 0.5
      i += 1
    }
  }
}
