var audioStream = document.getElementById('stream');

var playButton = document.getElementsByClassName('play-button')[0];
var stopButton = document.getElementsByClassName('stop-button')[0];

var speakerHigh = document.getElementsByClassName('speaker-high')[0];
var speakerLow = document.getElementsByClassName('speaker-low')[0];
var speakerNone = document.getElementsByClassName('speaker-none')[0];
var speakerMute = document.getElementsByClassName('speaker-mute')[0];

var volumeBar = document.getElementById('volume-bar');

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

volumeBar.addEventListener("input", function() {
  audioStream.volume = volumeBar.value;
});
