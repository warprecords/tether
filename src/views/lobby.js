$(function() {

  var root = window;
  var previousLobby = root.Lobby || {};

  var two = new Two({
    type: Two.Types.canvas,
    fullscreen: true
  });

  var signum, endingDestination = 0, beginningDestination = 0, timeline = new TWEEN(), callbacks = [];
  var threshold = 10, hits = 0, bump, bumpOut, hiding = false;

  var trigger = function(x, y) {
    hits++;
    beginningDestination = hits / threshold;
    var instrument = instruments[Math.floor(Math.random() * instruments.length)];
    instrument.start(undefined, x, y);
    if (hits >= threshold) {
      Lobby.end();
    }
  };

  var onWindowMousedown = function(e) {
    trigger(e.clientX, e.clientY);
  };
  var onWindowTouchstart = function(event) {
    var e = event.originalEvent;
    var touch = e.changedTouches[0];
    e.preventDefault();
    trigger(touch.pageX, touch.pageY);
    return false;
  };
  var onWindowTouchmove = function(e) {
    e.preventDefault();
    return false;
  };
  var onWindowTouchend = function(e) {
    e.preventDefault();
    return false;
  };
  var onWindowKeydown = function() {
    trigger();
  };

  var bindEvents = _.once(function() {
    Lobby.$elem
      .bind('mousedown', onWindowMousedown)
      .bind('touchstart', onWindowTouchstart)
      .bind('touchmove', onWindowTouchmove)
      .bind('touchend touchcancel', onWindowTouchend);
  });

  var Lobby = root.Lobby = {

    id: 0,

    init: false,

    end: _.identity,

    _ready: false,

    loaded: function() {
      Lobby.ready = true;
      _.each(callbacks, function(c) {
        c();
      });
      callbacks.length = 0;
      return Lobby;
    },

    ready: function(f) {
      if (Lobby._ready) {
        f();
        return Lobby;
      }
      if (_.indexOf(callbacks, f) >= 0) {
        return Lobby;
      }
      callbacks.push(f);
      return Lobby;
    },

    show: function(callback) {
      Lobby.initialize();
      Lobby.$elem.fadeIn(callback);
      return Lobby;
    },

    hide: function() {
      $window.unbind('keydown', onWindowKeydown);
      hiding = true;
      Lobby.$elem.fadeOut(Lobby.reset);
      _.each(instruments, function(i) {
        i.sound.stop();
      });
      return Lobby;
    },

    initialize: function() {

      if (Lobby.init) {
        return;
      }

      var $signum = Lobby.$elem.find('#signum');

      outline = two.interpret($signum[0]).center();
      outline.noFill().linewidth = 20;
      outline.stroke = 'rgba(255, 255, 255, 0.2)';

      signum = two.interpret($signum[0]).center();
      signum.noFill().stroke = 'rgba(255, 255, 255, 0.7)';

      var scale = 1, duration = 100;
      bumpOut = new TWEEN.Tween(signum)
        .parent(timeline)
        .easing(TWEEN.Easing.Circular.Out)
        .delay(duration)
        .onUpdate(function() {
          outline.scale = signum.scale;
        });

      bump = new TWEEN.Tween(signum)
        .parent(timeline)
        .easing(TWEEN.Easing.Circular.In)
        .onUpdate(function() {
          outline.scale = signum.scale;
        });

      two
        .bind('resize', function() {

          scale = (two.width < 600 || two.height < 200) ? 0.33 : 1;

          outline.scale = scale;
          signum.scale = scale;

          bumpOut.to({ scale: scale }, duration);
          bump.to({ scale: scale * 1.033 }, duration);

          outline.translation.set(two.width / 2, two.height / 2);
          signum.translation.set(two.width / 2, two.height / 2);

        })
        .bind('update', function() {

          timeline.update();
          var delta = endingDestination - signum._ending;

          if (Math.abs(delta) > 0.001) {
            signum.ending = delta * 0.0625 + signum._ending;
          }

          delta = beginningDestination - signum._beginning;

          if (Math.abs(delta) > 0.001) {
            signum.beginning = delta * 0.0625 + signum._beginning;
          }

          if (!hiding) {
            return;
          }

          for (i = 0, l = instruments.length; i < l; i++) {
            instruments[i].volume -= instruments[i].volume * 0.125;
          }

        });
      signum.ending = 0;
      two.trigger('resize');
      Lobby.init = true;
      two.appendTo(Lobby.$elem[0]).play();
      return Lobby;
    },

    start: function() {
      $window.unbind('keydown', onWindowKeydown);
      $window.bind('keydown', onWindowKeydown);
      two.play();
      _.each(instruments, function(i) {
        i.sound.volume = 1;
      });
      _.delay(function() {
        bump.start();
        bumpOut.start();
      }, 1000);
      bindEvents();
      return Lobby;
    },

    updateLoader: function(pct) {
      endingDestination = pct;
      return Lobby;
    },

    reset: function() {
      hiding = false;
      two.pause();
      return Lobby;
    }

  };

  var loaded = _.after(animations.types.length, Lobby.loaded);
  var instruments = _.map(animations.types, function(name) {
    instrument = new animations[name](two, timeline);
    instrument.sound = new Sound('./data/audio/clips/' + name.toLowerCase() + '.mp3', loaded);
    return instrument;
  });

});