/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var superclass = animations.Animation;
  var TEMP = {};

  var Hats = function(parent) {

    superclass.apply(this, arguments);
    parent.add(this.shape);

  };

  _.extend(Hats.prototype, superclass.prototype, {

    duration: 750,

    easingIn: TWEEN.Easing.Elastic.Out,
    easingOut: TWEEN.Easing.Circular.In,

    construct: function() {

      var scope = this;

      this.width = 75;
      this.height = 15;

      var w = 75;
      var h = 15;
      this.shape = new Two.Polygon([
        new Two.Anchor(- w / 2, - h / 2),
        new Two.Anchor(w / 2, - h / 2),
        new Two.Anchor(w / 2, h / 2),
        new Two.Anchor(- w / 2, h / 2)
      ], true);

      superclass.prototype.construct.call(this);

      this.destination = { rotation: Math.PI / 2 };

      // Animate In
      // Only push parallel animations
      this.tweens.push(
        new TWEEN.Tween(this.shape)
          .parent(this.timeline || timeline)
          .to(this.destination, this.duration)
          .easing(this.easingIn)
      );

      var vertexDestination = { y: 0 };

      this.tweens.outs = _.map(_.range(4), function(i) {
        var v = this.shape.vertices[i];
        return new TWEEN.Tween(v)
          .parent(this.timeline || timeline)
          .to(vertexDestination, this.duration / 4)
          .delay(this.duration)
          .easing(this.easingOut);
      }, this);

      this.tweens.outs[0].onComplete(function() {
        scope.reset();
      });

      this.tweens.outs.start = function(time) {
        for (var i = 0, l = scope.tweens.outs.length; i < l; i++) {
          scope.tweens.outs[i].start(time);
        }
      };

      return this;

    },

    start: function(time, x, y) {

      this.reset();

      superclass.prototype.start.apply(this, arguments);

      if (x && y) {
        this.shape.translation.set(x, y);
      }

      this.tweens.outs.start(time);
      this.shape.visible = true;

      return this;

    },

    reset: function() {

      superclass.prototype.reset.call(this);

      this.shape.rotation = 0;
      this.destination.rotation = Math.floor(Math.random() * 7 + 1) * Math.PI / 2;
      this.destination.rotation *= (Math.random() > 0.5) ? - 1 : 1;
      this.shape.visible = false;

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

      this.shape.scale = (Math.random() + 1) * TEMP.scale;
      this.shape.linewidth = (this.thickness / this.shape.scale) * TEMP.scale;

      if (this.shell === animations.Animation.Mode.fill || (this.shell === animations.Animation.Mode.random && Math.random() > 0.5)) {
        this.shape.fill = animations.white;
        this.shape.noStroke();
      } else {
        this.shape.noFill();
        this.shape.stroke = animations.white;
      }

      var vw = animations.variation * this.width / 2;
      var vh = animations.variation * this.height / 2;

      this.shape.vertices[0].set(- this.width / 2 + getRandom(vw), - this.height / 2 + getRandom(vh));
      this.shape.vertices[1].set(this.width / 2 + getRandom(vw), - this.height / 2 + getRandom(vh));
      this.shape.vertices[2].set(this.width / 2 + getRandom(vw), this.height / 2 + getRandom(vh));
      this.shape.vertices[3].set(- this.width / 2 + getRandom(vw), this.height / 2 + getRandom(vh));

      this.tweens[0].stop();
      this.tweens[0].to(this.destination, this.duration);

      for (var i = 0, l = this.tweens.outs.length; i < l; i++) {
        this.tweens.outs[i].stop();
      }

      return this;

    },

    resize: function() {

      superclass.prototype.resize.call(this);

      return this;

    }

  });

  function getRandom(v) {
    return v * Math.random() - v / 2;
  }

  animations.register('Hats', Hats);

})();