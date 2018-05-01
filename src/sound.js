/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousSound = root.Sound || {};
  var callbacks = [], ctx, analysis;

  // Force polyfill for Web Audio
  root.addEventListener('load', function() {
    root.AudioContext = root.AudioContext || root.webkitAudioContext;
    Sound._ready = true;
    try {
      Sound.ctx = ctx = new root.AudioContext();
      Sound.analysis = analysis = ctx.createAnalyser();
      analysis.connect(ctx.destination);
      Sound.has = true;
      _.each(callbacks, function(c) {
        c.call(Sound);
      });
    } catch (e) {
      delete Sound.ctx;
      Sound.has = false;
    }
    callbacks.length = 0;
  }, false);

  var Sound = root.Sound = function(url, callback) {

    this.url = url;

    Sound.get(url, _.bind(function(buffer) {

      this.buffer = buffer;

      this.gain = this.attached = ctx.createGain();
      this.gain.connect(analysis);
      this.gain.gain.value = Math.max(Math.min(this._volume, 1.0), 0.0);

      this._ready = true;

      if (_.isFunction(callback)) {
        callback.call(this);
      }

      this.trigger('load');

    }, this));

  };

  _.extend(Sound, {

    _ready: false,

    ready: function(func) {
      if (Sound._ready) {
        func.call(Sound);
        return;
      }
      callbacks.push(func);
    },

    noConflict: function() {
      root.Sound = previousAudio;
      return this;
    },

    get: function(url, callback) {
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'arraybuffer',
        success: function(data) {
          Sound.ready(function() {
            ctx.decodeAudioData(data, function(buffer) {
              if (_.isFunction(callback)) {
                callback(buffer);
              }
            });
          });
        },
        error: function(e) {
          console.log('Error loading', url, e);
        }
      });
    }

  });

  _.extend(Sound.prototype, Backbone.Events, {

    _volume: 1.0,

    _speed: 1.0,

    _currentTime: 0,

    _time: 0,

    playing: false,

    applyFilter: function(node) {

      if (this.filter) {
        this.filter.disconnect(this.gain);
      }

      this.filter = this.attached = node;
      this.filter.connect(this.gain);

      return this;

    },

    stop: function(options) {

      if (!this.source || !this.playing) {
        return this;
      }

      var params = _.defaults(options || {}, {
        time: ctx.currentTime
      });

      if (_.isFunction(this.source.stop)) {
        this.source.stop(params.time);
      } else {
        this.source.noteOff(params.time);
      }

      // this.source.disconnect(this.attached);
      this.playing = false;

      this._time = 0;

      return this;

    },

    pause: function() {
      this.stop();
      return this;
    },

    play: function(options) {

      var params = _.defaults(options || {}, {
        time: ctx.currentTime,
        loop: false,
        offset: 0,
        duration: this.buffer.duration
      });

      this._currentTime = params.time;

      // Remove previous source
      // if (this.source) {
      //   this.source.disconnect(this.attached);
      // }

      if (ctx && /suspended/.test(ctx.state)) {
        ctx.resume();
      }

      this.source = ctx.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.attached);
      this.source.loop = params.loop;

      if (_.isFunction(this.source.start)) {
        this.source.start(params.time, params.offset, params.duration - params.offset);
      } else if (_.isFunction(this.source.noteOn)) {
        this.source.noteOn(params.time, params.offset, params.duration - params.offset);
      }

      this.playing = true;

      return this;

    }

  });

  Object.defineProperty(Sound.prototype, 'volume', {
    get: function() {
      return this._volume;
    },
    set: function(v) {
      this._volume = v;
      if (this.gain) {
        this.gain.gain.value = Math.max(Math.min(this._volume, 1.0), 0.0);
      }
    }
  });

  Object.defineProperty(Sound.prototype, 'speed', {

    get: function() {
      return this._speed;
    },
    set: function(v) {
      this._speed = v;
      if (this.source) {
        this.source.playbackRate.value = v;
      }
    }

  });

  Object.defineProperty(Sound.prototype, 'currentTime', {

    get: function() {
      var delta = (ctx.currentTime - this._currentTime) * this._speed;
      this._time += delta;
      this._currentTime = ctx.currentTime;
      return this._time;
    }

  });

  Object.defineProperty(Sound.prototype, 'millis', {

    get: function() {
      return Math.floor(this.currentTime * 1000);
    }

  });

})();
