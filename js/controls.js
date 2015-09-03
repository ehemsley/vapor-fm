var audioStream = document.getElementById('stream');

var playButton = document.getElementById('play-button');
var stopButton = document.getElementById('stop-button');

var speakerHigh = document.getElementById('speaker-high');
var speakerLow = document.getElementById('speaker-low');
var speakerNone = document.getElementById('speaker-none');

var volumeBar = document.getElementById('volume-bar');
volumeBar.value = 1.0;

var previousVolume = 1.0;

var HideAllSpeakers = function() {
  speakerHigh.style.visibility = "hidden";
  speakerLow.style.visibility = "hidden";
  speakerNone.style.visibility = "hidden";
}

playButton.style.visibility = "hidden";

stopButton.onclick = function() {
  audioStream.pause();
  stopButton.style.visibility = "hidden";
  playButton.style.visibility = "visible";
}

playButton.onclick = function() {
  audioStream.load();
  audioStream.play();
  playButton.style.visibility = "hidden";
  stopButton.style.visibility = "visible";
}

speakerHigh.onclick = function() {
  previousVolume = volumeBar.value;
  volumeBar.value = 0;
  UpdateVolume();
}

speakerLow.onclick = function() {
  previousVolume = volumeBar.value;
  volumeBar.value = 0;
  UpdateVolume();
}

speakerNone.onclick = function() {
  volumeBar.value = previousVolume;
  UpdateVolume();
}

var UpdateVolume = function() {
  HideAllSpeakers();
  if (volumeBar.value == 0) {
    speakerNone.style.visibility = "visible";
  } else if (volumeBar.value > 0 && volumeBar.value < 0.5) {
    speakerLow.style.visibility = "visible";
  } else {
    speakerHigh.style.visibility = "visible";
  }
  audioStream.volume = volumeBar.value;
}

volumeBar.addEventListener("input", UpdateVolume);
