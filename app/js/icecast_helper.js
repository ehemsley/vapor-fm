const StringHelper = require('js/string_helper')

let IcecastHelper = {
  parseSongData: function (songData) {
    // still broken if song has dash in it but not multiple artsts
    // maybe check for duplication of artist name instead and base it on that
    let artistName = ''
    let songName = ''

    if (StringHelper.countOccurrences(songData, ' - ') < 1) {
      artistName = 'you are tuned in'
      songName = 'to vapor fm'
    } else if (StringHelper.countOccurrences(songData, ' - ') === 1) {
      artistName = songData.split(' - ')[0]
      songName = songData.split(' - ')[1]
    } else {
      const artistSubStringLocation = StringHelper.nthOccurrence(songData, ' - ', 1)
      const songSubStringLocation = StringHelper.nthOccurrence(songData, ' - ', 2)
      artistName = songData.substring(artistSubStringLocation + 3, songSubStringLocation)
      songName = songData.substring(songSubStringLocation + 3, songData.length)
    }

    return { artistName: artistName, songName: songName }
  }
}

IcecastHelper.getSongData = function (successCallback) {
  var xhr = new XMLHttpRequest()
  xhr.timeout = 2000
  xhr.open('GET', 'http://168.235.77.138:8000/status-json.xsl')
  xhr.onload = () => {
    if (xhr.status === 200) {
      let songData = JSON.parse(xhr.response).icestats.source.title
      successCallback(IcecastHelper.parseSongData(songData))
    } else {
      console.log('Icecast request failed.  Returned status of ' + xhr.status)
    }
  }
  xhr.send()
}

module.exports = IcecastHelper
