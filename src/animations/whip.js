(function() {

  var superclass = animations.Animation;
  var TEMP = {};

  var Whip = function(parent) {

    superclass.apply(this, arguments);
    parent.add(this.shape);

  };

  _.extend(Whip.prototype, superclass.prototype, {

    thickness: 8,

    amount: 16,

    duration: 500,

    easingIn: TWEEN.Easing.Circular.Out,

    easingOut: TWEEN.Easing.Elastic.Out,

    construct: function() {

      var scope = this;

      var points = _.map(_.range(this.amount), function(i) {
        return new Two.Anchor();
      });

      this.shape = new Two.Polygon(points, false, true);
      this.shape.cap = 'round';
      this.shape.join = 'miter';
      this.shape.miter = 4;

      superclass.prototype.construct.call(this);

      this.destinationIn = { rotation: Math.PI * 2 };
      this.destinationOut = { scale: 0.0 };

      // Animate In
      // Only push parallel animations
      this.tweens.push(
        new TWEEN.Tween(this.shape)
          .parent(this.timeline || timeline)
          .to(this.destinationIn, this.duration / 2)
          .easing(this.easingIn)
      );

      // Animate Out
      this.out = new TWEEN.Tween(this.shape)
        .to({ linewidth: 0 }, this.duration)
        .parent(this.timeline || timeline)
        .delay(this.duration)
        .easing(TWEEN.Easing.Sinusoidal.In)
        .onComplete(function() {
          scope.shape.visible = false;
        });

      this.outs = _.map(points, function(p) {

        return new TWEEN.Tween(p)
          .parent(this.timeline || timeline)
          .to({ y: 0 }, this.duration)
          .delay(this.duration + Math.random() * this.duration / 12)
          .easing(this.easingOut);

      }, this);

      return this;

    },

    start: function(time, x, y) {

      this.reset();

      superclass.prototype.start.apply(this, arguments);

      if (x && y) {
        this.shape.translation.set(x, y);
      }

      for (var i = 0; i < this.amount; i++) {
        this.outs[i].start(time);
      }
      this.out.start(time);
      this.shape.visible = true;

      return this;

    },

    reset: function() {

      superclass.prototype.reset.call(this);

      this.shape.visible = false;
      this.shape.rotation = Math.PI * 2 * Math.random();
      this.destinationIn.rotation = this.shape.rotation + Math.PI * (0.5 * Math.random() - 0.5);

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
      this.shape.scale = (1 + Math.random()) * TEMP.scale;

      this.shape.noFill();
      this.shape.stroke = animations.white;

      var radius = (this.parent.height / 4) * TEMP.scale;
      var variation = radius * animations.variation;

      var x, y;

      for (var i = 0, l = this.shape.vertices.length; i < l; i++) {

        var pct = i / (l - 1);
        var r = radius + (Math.random() * variation - variation / 2);
        x = r * Math.cos(Math.PI * pct);
        y = r * Math.sin(Math.PI * pct);

        this.shape.vertices[i].set(x, y);

      }

      this.tweens[0].stop();
      this.out.stop();
      for (i = 0; i < this.amount; i++) {
        this.outs[i].stop();
      }

      this.tweens[0].to(this.destinationIn, this.duration / 2);

      return this;

    },

    resize: function() {

      superclass.prototype.resize.call(this);

      return this;

    }

  });

  animations.register('Whip', Whip);

})();