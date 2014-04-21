/**
 * @jonobr1 / http://jonobr1.com/
 */

$(function() {

  var root = window;
  var previousExperience = root.Experience || {};

  var TEMP = new Two.Vector();

  mouse.previous = new Two.Vector();

  two = new Two({
    type: Two.Types.canvas,
    fullscreen: true,
    // autostart: true,
    overdraw: true,
    ratio: 1.0
  });

  var background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
  background.emergency = 0;
  background.alpha = 1;

  two.world = two.makeGroup();

  camera = new Camera(two, 0.05, 8, two.world);

  grid = new GridMode(camera);

  var triggers, playbacks, resourcesLoaded = _.after(3, function() {

    if (has.webgl) {
      THREE.EffectsView.initialize();
      Experience.$elem.append(three.renderer.domElement);
    } else {
      two.appendTo(Experience.$elem[0]);
    }

    two.bind('update', function(frameCount, timeDelta) {

      if (_.isUndefined(timeDelta)) {
        return;
      }

      if (track.ended) {
        if (!Experience.ended) {
          Experience.end();
          Experience.ended = true;
        }
      }

      var delta = (timeDelta / 1000) * currentSpeed;

      if (background.emergency > 0.001) {
        background.emergency -= background.emergency * 0.033 * currentSpeed;
        var c = Math.floor(255 * background.emergency * 0.75);
        background.fill = 'rgba(' + c + ', 0, ' + Math.floor(c / 4) + ',' + background.alpha + ')';
      }

      Sound.analysis.getByteFrequencyData(frequencyData);

      trail.update(frequencyData, Sound.analysis.frequencyBinCount);
      starfield.update(frequencyData, Sound.analysis.frequencyBinCount);
      if (has.webgl) {
        three.updateFrequency(frequencyData, Sound.analysis.frequencyBinCount);
      }

      camera.updateTranslation();

      currentTime += delta;

      crossFade.timeline.update();

      timeline.update(currentTime * 1000);

      track.ended = currentTime > track.buffer.duration;

      _.each(playbacks, playback);

    });

    Sound.analysis.fftSize = 32;
    frequencyData = new Uint8Array(Sound.analysis.frequencyBinCount);

    Experience.loaded();

  });

  $.getJSON('./data/triggers.json', function(json) {

    triggers = json;
    playbacks = _.map(triggers, function(data, name) {

      var callback;

      switch (name) {
        case 'CameraMode':
          callback = function() {
            camera.mode = Camera.Modes.cruise;
            triggerDeform();
          };
          break;
        case 'Wakka':
          callback = function() {
            camera.nextVelocityDestination();
          };
          break;
        case 'DrawMode':
          callback = function() {
            animations.nextDrawMode();
          };
          break;
        case 'AnimationMode':
          callback = function() {
            animations.nextAnimationMode();
          };
          break;
        case 'GridMode':
          callback = function() {
            grid.nextDestination();
          };
          break;
        case 'Emergency':
          callback = function() {
            if (has.webgl) {
              three.emergency();
            } else {
              emergency();
            }
          };
          break;
        default:
          callback = function() {
            instruments[name].active.start(currentTime * 1000);
          };
      }

      return new Playback(data, callback);

    });

    resourcesLoaded();

  });

  currentTime = 0;

  track = new Sound('./data/audio/teth_full.mp3', resourcesLoaded);
  track.ended = false;
  track.bpm = 120;
  track.slow = new Sound('./data/audio/teth_full_slow.mp3', function() {

    track.slow.applyFilter(Sound.ctx.createBiquadFilter());
    track.slow.filter.type = track.slow.filter.PEAKING;
    // middle of the road.
    if (!track.slow.filter.frequency.maxValue) {
      track.slow.filter.frequency.maxValue = 22050;
    }
    if (!track.slow.filter.frequency.minValue) {
      track.slow.filter.frequency.minValue = 10;
    }
    if (!track.slow.filter.gain.maxValue) {
      track.slow.filter.gain.maxValue = 40;
    }
    track.slow.filter.frequency.value = track.slow.filter.frequency.maxValue / 4;
    // track.slow.filter.gain.value = 20;
    // track.slow.filter.Q.value = 2;

    resourcesLoaded();

  });
  track.slow.bpm = 40;
  track.slow.volume = 0;

  var activeTrack = track;

  var playback = function(p) {
    p.update(currentTime);
  };

  var stopTrack = function() {
    // background.fill = 'rgba(0, 0, 0, 0.05)';
    track.stop();
    crossFade.stop();
  };
  var stopSlowTrack = function() {
    track.slow.stop();
    crossFade.stop();
  };
  var getSpeedRatio = function() {
    return track.slow.bpm / track.bpm;
  };
  var drag = function() {

    var pct, vpct, hpct, max, min, v, freq, q;
    var velocity = mouse.previous.distanceTo(mouse) / 10;

    if (!dragging) {
      return;
    }

    if (!trail.initialized) {
      trail.start(mouse.x, mouse.y);
      trail.initialized = true;
    } else {
      trail.move(mouse.x, mouse.y);
    }

    vpct = mouse.y / two.height;
    hpct = mouse.x / two.width;

    // Update frequency
    max = track.slow.filter.frequency.maxValue * 0.5;
    min = track.slow.filter.frequency.minValue;
    v = (1 - Math.sin(Math.PI * hpct)) * (max - min) + min;

    v = Math.max(Math.min(v, max), min);
    track.slow.filter.frequency.value = v;

    // Update gain
    max = track.slow.filter.gain.maxValue * 0.66;
    min = 0;
    v = velocity * (max - min) + min;

    v = Math.max(Math.min(v, max), min);
    track.slow.filter.gain.value = v;

  };
  var emergency = function() {
    background.emergency = 1.0;
  };

  var startDragging = function() {
    trail.initialized = false;
    currentSpeed = getSpeedRatio();
    dragging = true;
    crossFade
      .to({ t: 0, zoom: camera.limits.max }, crossFade.duration)
      .easing(TWEEN.Easing.Circular.Out)
      .onComplete(stopTrack)
      .start();

    if (!track.slow.playing && !track.ended) {
      track.slow.play({
        offset: currentTime / getSpeedRatio()
      });
    }
    drag();
  };

  var crossFadeParam = { t: 1, zoom: 1 }, t = 1;
  var crossFade = new TWEEN.Tween(crossFadeParam);
  crossFade.timeline = new TWEEN();
  crossFade.duration = 750;
  crossFade
    .parent(crossFade.timeline)
    .onUpdate(function() {
      t = crossFadeParam.t;
      track.speed = t * (1 - getSpeedRatio()) + getSpeedRatio();
      track.volume = t;
      track.slow.volume = 1 - t;
      camera.zoomSet(crossFadeParam.zoom, mouse.x, mouse.y);
      background.alpha = (t * (1 - 0.05) + 0.05);
      background.fill = 'rgba(' + Math.floor(255 * background.emergency) + ', 0, 0,' + background.alpha + ')';
      if (has.webgl) {
        three.quad.material.uniforms.dragging.value = 1 - t;
      }
    });

  var deform = new TWEEN.Tween(animations)
    .to({ variation: 0.33 }, 120000)
    .parent(crossFade.timeline);
  var triggerDeform = _.once(function() {
    deform.start(currentTime * 1000);
  });

  two
    .bind('resize', function() {

      var width = two.width / 2, height = two.height / 2;

      background.translation.set(width, height);

      background.vertices[0].x = background.vertices[3].x = - width;
      background.vertices[0].y = background.vertices[1].y = - height;
      background.vertices[1].x = background.vertices[2].x = width;
      background.vertices[2].y = background.vertices[3].y = height;

      animations.resize();

    });

  var trail = new Trail(two);
  trail.temp = new Two.Vector();

  // Override the two.add method for adding to world, not to scene
  two.add = function() {
    Two.prototype.add.apply(this, arguments);
    this.world.add(_.toArray(arguments));
    return this;
  };

  var starfield = new Starfield(two, camera);

  var instruments = {};
  _.each(animations.types, function(name) {
    instruments[name] = new Pool(animations[name], has.mobile ? 3 : 5, two);
  });

  background.fill = animations.black;

  starfield.addTweens(timeline);

  function onWindowKeydown(e) {

    switch (e.which) {
      case 52:
        instruments.Bass.active.start(currentTime * 1000);
        break;
      case 53:
        instruments.HighBass.active.start(currentTime * 1000);
        break;
      case 54:
        instruments.Hats.active.start(currentTime * 1000);
        break;
      case 55:
        instruments.Drone.active.start(currentTime * 1000);
        break;
      case 56:
        instruments.Whip.active.start(currentTime * 1000);
        break;
    }

  }

  function onWindowMousedown(e) {

    e.preventDefault();

    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.previous.copy(mouse);

    startDragging();

    return false;

  }

    function onWindowTouchstart(event) {

    var e = event.originalEvent;
    var touch = e.changedTouches[0];

    e.preventDefault();

    mouse.x = touch.pageX;
    mouse.y = touch.pageY;
    mouse.previous.copy(mouse);

    startDragging();

    return false;

  }

  function onWindowMousemove(e) {

    mouse.previous.copy(mouse);
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    var vpct = mouse.y / two.height;

    drag();

  }

  function onWindowTouchmove(event) {

    event.preventDefault();

    var e = event.originalEvent;
    var touch = e.changedTouches[0];

    mouse.previous.copy(mouse);
    mouse.x = touch.pageX;
    mouse.y = touch.pageY;

    drag();

    return false;

  }

  function onWindowRelease(e) {

    e.preventDefault();

    starfield.redistribute();

    trail.release();
    currentSpeed = 1.0;

    dragging = false;
    crossFade
      .to({ t: 1, zoom: 1 }, crossFade.duration)
      .easing(TWEEN.Easing.Circular.In)
      .onComplete(stopSlowTrack)
      .start();

    if (!track.playing && !track.ended) {
      track.play({
        offset: currentTime
      });
    }

    return false;

  }

  var Experience = root.Experience = {

    _callbacks: [],

    _ready: false,

    id: 1,

    ended: false,

    end: _.identity,

    loaded: function() {
      Experience._ready = true;
      _.each(Experience._callbacks, function(f) {
        f();
      });
      Experience._callbacks.length = 0;
      return Experience;
    },

    // Public facing methods

    ready: function(f) {
      if (Experience._ready) {
        f();
        return Experience;
      }
      if (_.indexOf(Experience.callbacks, f) >= 0) {
        return Experience;
      }
      Experience._callbacks.push(f);
      return Experience;
    },

    show: function(callback) {
      Experience.$elem.fadeIn(callback);
      return Experience;
    },

    hide: function() {
      Experience.$elem.fadeOut(function() {
        setTimeout(function() {
          Experience.reset();
        }, 1000)
      });
      return Experience;
    },

    bind: function() {

      if (!Experience._ready) {
        Experience.ready(Experience.bind);
        console.warn('Still waiting to load resources of Experience.');
        return;
      }

      Experience.$elem
        .bind('keydown', onWindowKeydown)
        .bind('mousedown', onWindowMousedown)
        .bind('touchstart', onWindowTouchstart)
        .bind('mousemove', onWindowMousemove)
        .bind('touchmove', onWindowTouchmove)
        .bind('mouseup touchend touchcancel', onWindowRelease);

      return Experience;

    },

    unbind: function() {

      Experience.$elem
        .unbind('keydown', onWindowKeydown)
        .unbind('mousedown', onWindowMousedown)
        .unbind('touchstart', onWindowTouchstart)
        .unbind('mousemove', onWindowMousemove)
        .unbind('touchmove', onWindowTouchmove)
        .unbind('mouseup touchend touchcancel', onWindowRelease);

      return Experience;

    },

    reset: function() {

      two.pause();
      track.stop();
      track.slow.stop();
      currentTime = 0;
      track.ended = false;
      Experience.ended = false;
      Experience.unbind();

      return Experience;

    },

    setVolume: function(v) {
      return Experience;
    },

    play: function() {
      if (track.ended) {
        Experience.reset();
      }
      if (two.playing) {
        return Experience;
      }
      Experience.bind();
      two._lastFrame = 0;
      two.play();
      track.play({
        offset: currentTime
      });
      return Experience;
    },

    pause: function() {
      if (!two.playing) {
        return Experience;
      }
      Experience.unbind();
      two.pause();
      track.stop();
      track.slow.stop();
      return Experience;
    }

  };

});