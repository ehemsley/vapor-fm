var ctx = new AudioContext();
var audio = document.getElementById('stream');
var audioSrc = ctx.createMediaElementSource(audio);
var analyser = ctx.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 1024;

audioSrc.connect(analyser);

frequencyData = new Uint8Array(analyser.frequencyBinCount);

function getAverageVolume(array) {
  var values = 0;

  var average;

  var length = array.length;

  for (var i = 0; i < length; i++) {
    values += array[i];
  }

  average = values / length;
  return average;
}
