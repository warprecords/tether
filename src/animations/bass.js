/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var superclass = animations.Animation;
  var TEMP = {};

  var Bass = function(parent) {

    superclass.apply(this, arguments);
    parent.add(this.shape);

  };

  _.extend(Bass.prototype, superclass.prototype, {

    amount: 8,

    duration: 500,

    easingIn: TWEEN.Easing.Elastic.Out,

    easingOut: TWEEN.Easing.Circular.In,

    construct: function() {

      var scope = this;

      var points = _.map(_.range(this.amount), function(i) {
        return new Two.Anchor();
      });

      this.shape = new Two.Polygon(points, true, true);
      // this.shape.linewidth = this.thickness = 8;

      superclass.prototype.construct.call(this);

      this.destinationIn = { scale: 1.0 };
      this.destinationOut = { scale: 0.0 };

      // Animate In
      // Only push parallel animations
      this.tweens.push(
        new TWEEN.Tween(this.shape)
          .parent(this.timeline || timeline)
          .to(this.destinationIn, this.duration)
          .easing(this.easingIn)
      );

      // Animate Out
      this.out = new TWEEN.Tween(this.shape)
        .parent(this.timeline || timeline)
        .to(this.destinationOut, this.duration / 2)
        .delay(this.duration)
        .easing(this.easingOut);
        // .onComplete(function() {
        //   scope.reset();
        // });

      return this;

    },

    start: function(time, x, y) {

      this.reset();

      superclass.prototype.start.apply(this, arguments);

      if (x && y) {
        this.shape.translation.set(x, y);
      }

      this.out.start(time);
      this.shape.visible = true;

      return this;

    },

    reset: function() {

      superclass.prototype.reset.call(this);

      this.destinationIn.scale = Math.random() * 2 + 1;
      this.destinationOut.rotation = this.shape.rotation + (Math.random() > 0.5 ? - 1 : 1) * (Math.PI * 2 * Math.random());
      this.shape.scale = 0.0;
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

      this.shape.linewidth = this.thickness * TEMP.scale;

      if (this.shell === animations.Animation.Mode.fill || (this.shell === animations.Animation.Mode.random && Math.random() > 0.5)) {
        this.shape.fill = animations.white;
        this.shape.noStroke();
      } else {
        this.shape.noFill();
        this.shape.stroke = animations.white;
      }

      var radius = (this.parent.height / 8) * TEMP.scale;
      var variation = radius * animations.variation;

      for (var i = 0, l = this.shape.vertices.length; i < l; i++) {

        var pct = i / l;
        var theta = Math.PI * 2 * pct;
        var r = radius + (Math.random() * variation - variation / 2);
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);

        this.shape.vertices[i].set(x, y);

      }

      this.tweens[0].stop();
      this.out.stop();

      this.tweens[0].to(this.destinationIn, this.duration);

      return this;

    },

    resize: function() {

      superclass.prototype.resize.call(this);

      return this;

    }

  });

  animations.register('Bass', Bass);

})();