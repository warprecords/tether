/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousAnimations = root.animations || {};

  var animationMode = {
    destinations: [],
    index: 0
  };
  var drawMode = {
    destinations: [],
    index :0
  };

  var animations = root.animations = {

    types: [],

    list: [],

    white: 'rgba(255, 255, 255, 0.7)',

    black: 'rgba(0, 0, 0, 0.9)',

    variation: 0,

    Animation: function(parent, timeline) {

      this.timeline = timeline;

      this.parent = parent;
      this.tweens = [];
      this.construct().reset();

    },

    register: function(name, obj) {

      animations[name] = obj;
      animations.types.push(name);
      return animations;

    },

    nextAnimationMode: function() {
      animationMode.index = (animationMode.index + 1) % animationMode.destinations.length;
      animations.Animation.Mode.activeAnimation = animations.Animation.Mode[animationMode.destinations[animationMode.index]];
      return animations;
    },

    nextDrawMode: function() {
      drawMode.index = (drawMode.index + 1) % drawMode.destinations.length;
      animations.Animation.Mode.activeDraw = animations.Animation.Mode[drawMode.destinations[drawMode.index]];
      return animations;
    },

    resize: function() {
      for (var i = 0, l = animations.list.length; i < l; i++) {
        animations.list[i].resize();
      }
      return animations;
    }

  };

  _.extend(animations.Animation, {

    Mode: {
      // animation
      next: 'next',
      previous: 'previous',
      random: 'random',

      // draw
      fill: 'fill',
      stroke: 'stroke',
      // random

      // active modes
      activeAnimation: 'next',
      activeDraw: 'fill'
    }

  });

  animationMode.destinations = [
    animations.Animation.Mode.next,
    animations.Animation.Mode.previous,
    animations.Animation.Mode.random,
    animations.Animation.Mode.next,
    animations.Animation.Mode.random
  ];

  drawMode.destinations = [
    animations.Animation.Mode.fill,
    animations.Animation.Mode.stroke,
    animations.Animation.Mode.fill,
    animations.Animation.Mode.stroke,
    animations.Animation.Mode.random
  ];

  _.extend(animations.Animation.prototype, {

    animating: false,

    shell: false,

    thickness: 8,

    construct: function() {
      animations.list.push(this);
      return this;
    },

    start: function(time) {
      if (this.animating) {
        this.reset();
      }
      if (this.sound) {
        this.sound.stop();
        this.sound.play();
      }
      for (var i = 0, l = this.tweens.length; i < l; i++) {
        this.tweens[i].start(time);
      }
      this.animating = true;
      return this;
    },

    update: function() {
      return this;
    },

    reset: function() {
      this.animating = false;
      this.shell = animations.Animation.Mode.activeDraw;
      return this;
    },

    resize: function() {
      return this;
    }

  });

  function getRandomColor() {
    return 'rgb(' +
      Math.floor(255 * Math.random()) + ',' +
      Math.floor(255 * Math.random()) + ',' +
      Math.floor(255 * Math.random()) + ')';
  }

})();