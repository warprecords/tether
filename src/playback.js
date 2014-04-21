(function() {

  var root = this;
  var previousPlayback = root.Playback || {};

  var Playback = root.Playback = function(data, callback) {

    this.data = data;

    if (_.isFunction(callback)) {
      this.onUpdate = callback;
    }

  };

  _.extend(Playback, {

    noConflict: function() {
      root.Playback = previousPlayback;
      return Playback;
    }

  });

  _.extend(Playback.prototype, {

    _time: 0,

    index: 0,

    clear: function() {
      this._time = 0;
      this.index = 0;
    },

    onUpdate: _.identity,

    update: function(time) {

      // Iterate toward the end of the data array
      var t = 0, l = this.data.length, i;
      var direction = time - this._time >= 0;
      this._time = time;

      if (direction) {

        // while (t < time && this.index < l) {
        for (i = this.index; i < l; i++) {
          t = this.data[i];
          if (t > time) {
            break;
          }
          this.onUpdate();
          this.index = i + 1;
        }

        return this;

      }

      // Iterate toward the beginning of the data array
      for (i = this.index; i >= 0; i++) {
        t = this.data[i];
        if (t < time) {
          break;
        }
        this.onUpdate();
        this.index = i - 1;
      }

      return this;


    }

  });

})();