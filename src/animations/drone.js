/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var superclass = animations.Animation;
  var TEMP = {};

  var Drone = function(parent) {

    superclass.apply(this, arguments);
    parent.add(this.shape);
    parent.add(this.outline);

  };

  _.extend(Drone.prototype, superclass.prototype, {

    duration: 750,

    easing: TWEEN.Easing.Circular.Out,

    construct: function() {

      var scope = this;

      this.shape = makeRectangle(0, 0, 25, 75);
      this.outline = makeRectangle(0, 0, 25, 75);
      // this.outline.linewidth = this.shape.linewidth = this.thickness = 8;

      superclass.prototype.construct.call(this);

      this.aposition = { x: 0, y: 0 };
      this.bposition = { x: 0, y: 0 };

      this.destination = { opacity: 0.0 };

      // Animate In
      // Only push parallel animations
      this.tweens.push(
        new TWEEN.Tween(this.shape.translation)
          .parent(this.timeline || timeline)
          .to(this.aposition, this.duration)
          .easing(this.easing),
          // .onComplete(function() {
          //   scope.reset();
          // }),
        new TWEEN.Tween(this.shape)
          .parent(this.timeline || timeline)
          .to(this.destination, this.duration)
          .easing(this.easing),
        new TWEEN.Tween(this.outline.translation)
          .parent(this.timeline || timeline)
          .to(this.bposition, this.duration)
          .easing(this.easing),
        new TWEEN.Tween(this.outline)
          .parent(this.timeline || timeline)
          .to(this.destination, this.duration)
          .easing(this.easing)
      );

      return this;

    },

    start: function(time, x, y) {

      this.reset();

      superclass.prototype.start.apply(this, arguments);

      if (x && y) {
        this.shape.translation.set(x, y);
      }

      this.shape.visible = true;
      this.outline.visible = true;

      return this;

    },

    reset: function() {

      superclass.prototype.reset.call(this);

      this.shape.visible = false;
      this.shape.opacity = 1.0;
      this.outline.visible = false;
      this.outline.opacity = 1.0;

      this.shape.rotation = this.outline.rotation = Math.floor(Math.random() * 8) * Math.PI / 4;

      if (window.grid) {
        grid.active[superclass.Mode.activeAnimation]().get(TEMP);
      } else {
        TEMP.x = this.parent.width * Math.random();
        TEMP.y = this.parent.height * Math.random();
        TEMP.scale = 1;
      }

      this.shape.translation.set(
        TEMP.x,
        TEMP.y
      );
      this.outline.translation.copy(this.shape.translation);

      this.outline.linewidth = this.shape.linewidth = this.thickness * TEMP.scale;
      this.outline.scale = this.shape.scale = (Math.random() * 2 + 1) * TEMP.scale;

      if (this.shell === animations.Animation.Mode.fill || (this.shell === animations.Animation.Mode.random && Math.random() > 0.5)) {

        this.shape.fill = animations.white;
        this.shape.noStroke();

        this.outline.noFill();
        this.outline.stroke = animations.white;

      } else {

        this.shape.noFill();
        this.shape.stroke = animations.white;

        this.outline.fill = animations.white;
        this.outline.noStroke();

      }

      // TODO: Parameterize
      var magnitude = Math.random() * 100 + 100;

      this.bposition.x = this.shape.translation.x + magnitude;
      this.aposition.y = this.bposition.y = this.shape.translation.y;
      this.aposition.x = this.shape.translation.x - magnitude / 4;

      this.tweens[0].stop();
      this.tweens[1].stop();
      this.tweens[2].stop();
      this.tweens[3].stop();
      this.tweens[0].to(this.aposition, this.duration);
      this.tweens[2].to(this.bposition, this.duration);

      return this;

    },

    resize: function() {

      superclass.prototype.resize.call(this);

      return this;

    }

  });

  animations.register('Drone', Drone);

  function makeRectangle(x, y, width, height) {
    var w = width;
    var h = height;
    return new Two.Polygon([
      new Two.Anchor(- w / 2, - h / 2),
      new Two.Anchor(w / 2, - h / 2),
      new Two.Anchor(w / 2, h / 2),
      new Two.Anchor(- w / 2, h / 2)
    ], true);
  }

})();