// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Page = (function() {
    function Page() {
      this.CheckKey = bind(this.CheckKey, this);
      this.DecreaseVolume = bind(this.DecreaseVolume, this);
      this.IncreaseVolume = bind(this.IncreaseVolume, this);
      this.audioInitializer = new AudioInitializer();
      this.renderController = new RenderController(this.audioInitializer);
      window.addEventListener('resize', this.renderController.OnResize, false);
      this.renderController.Render();
      document.onkeydown = this.CheckKey;
    }

    Page.prototype.IncreaseVolume = function() {
      this.audioInitializer.audioElement.volume += 0.1;
      this.renderController.UpdateVolumeDisplay(this.audioInitializer.audioElement.volume * 10);
    };

    Page.prototype.DecreaseVolume = function() {
      this.audioInitializer.audioElement.volume -= 0.1;
      this.renderController.UpdateVolumeDisplay(this.audioInitializer.audioElement.volume * 10);
    };

    Page.prototype.CheckKey = function(e) {
      e = e || window.event;
      if (e.keyCode === 38) {
        console.log('up');
        this.IncreaseVolume();
      } else if (e.keyCode === 40) {
        this.DecreaseVolume();
      }
    };

    return Page;

  })();

  $(function() {
    return new Page;
  });

}).call(this);
