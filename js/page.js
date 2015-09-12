// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Page = (function() {
    function Page() {
      this.UpdateVolume = bind(this.UpdateVolume, this);
      this.HideAllSpeakers = bind(this.HideAllSpeakers, this);
      var playButton, previousVolume, stopButton;
      this.audioInitializer = new AudioInitializer();
      this.visualizer = new HeartVisualizer(this.audioInitializer);
      window.addEventListener('resize', this.visualizer.OnResize, false);
      this.visualizer.Render();
      playButton = document.getElementById('play-button');
      stopButton = document.getElementById('stop-button');
      playButton.style.visibility = "hidden";
      this.speakerHigh = document.getElementById('speaker-high');
      this.speakerLow = document.getElementById('speaker-low');
      this.speakerNone = document.getElementById('speaker-none');
      this.volumeBar = document.getElementById('volume-bar');
      this.volumeBar.value = 1.0;
      previousVolume = 1.0;
      this.volumeBar.addEventListener('input', this.UpdateVolume);
      stopButton.onclick = (function(_this) {
        return function() {
          _this.audioInitializer.audioElement.pause();
          stopButton.style.visibility = "hidden";
          playButton.style.visibility = "visible";
        };
      })(this);
      playButton.onclick = (function(_this) {
        return function() {
          _this.audioInitializer.audioElement.load();
          _this.audioInitializer.audioElement.play();
          playButton.style.visibility = "hidden";
          stopButton.style.visibility = "visible";
        };
      })(this);
      this.speakerHigh.onclick = (function(_this) {
        return function() {
          previousVolume = _this.volumeBar.value;
          _this.volumeBar.value = "0";
          _this.UpdateVolume();
        };
      })(this);
      this.speakerLow.onclick = (function(_this) {
        return function() {
          previousVolume = _this.volumeBar.value;
          _this.volumeBar.value = "0";
          _this.UpdateVolume();
        };
      })(this);
      this.speakerNone.onclick = (function(_this) {
        return function() {
          _this.volumeBar.value = previousVolume;
          _this.UpdateVolume();
        };
      })(this);
    }

    Page.prototype.HideAllSpeakers = function() {
      this.speakerHigh.style.visibility = "hidden";
      this.speakerLow.style.visibility = "hidden";
      this.speakerNone.style.visibility = "hidden";
    };

    Page.prototype.UpdateVolume = function() {
      var parsedValue;
      this.HideAllSpeakers();
      parsedValue = parseFloat(this.volumeBar.value);
      if (parsedValue === 0) {
        this.speakerNone.style.visibility = "visible";
      } else if (parsedValue > 0 && parsedValue < 0.5) {
        this.speakerLow.style.visibility = "visible";
      } else {
        this.speakerHigh.style.visibility = "visible";
      }
      this.audioInitializer.audioElement.volume = this.volumeBar.value;
    };

    return Page;

  })();

  $(function() {
    return new Page;
  });

}).call(this);
