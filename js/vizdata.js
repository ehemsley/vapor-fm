var context = new AudioContext();
analyser = context.createAnalyser();

frequencyData = new Uint8Array(analyser.frequencyBinCount);
floats = new Float32Array(analyser.frequencyBinCount);

beatdetect = new FFT.BeatDetect(1024, 44100);

var audioElement = document.getElementById('stream');

audioElement.addEventListener("canplay", function() {
  var source = context.createMediaElementSource(audioElement);
  source.connect(analyser);
  source.connect(context.destination);

  sampleRate = context.sampleRate;
  beatdetect = new FFT.BeatDetect(analyser.frequencyBinCount, sampleRate);
  beatdetect.setSensitivity(1000);

  audioElement.play();
});

function getAverageVolume(array) {
  var values = 0;
  var average;
  for (var i = 0; i < array.length; i++) {
    values += array[i];
  }
  average = values / array.length;
  return average;
}
