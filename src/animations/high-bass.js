(function() {

  var superclass = animations.Animation;
  var TEMP = {};

  var HighBass = function(parent) {

    superclass.apply(this, arguments);
    parent.add(this.shape);

  };

  _.extend(HighBass.prototype, superclass.prototype, {

    resolution: 64,

    duration: 1250,

    radius: 75,

    easingIn: TWEEN.Easing.Bounce.Out,

    easingOut: TWEEN.Easing.Circular.In,

    construct: function() {

      var scope = this;

      var points = _.map(_.range(this.resolution), function(i) {
        return new Two.Anchor();
      }, this);

      this.shape = new Two.Polygon(points, true);
      // this.shape.linewidth = this.thickness = 8;

      superclass.prototype.construct.call(this);

      this.destinationIn = { ending: 1.0, rotation: Math.PI / 2 };
      this.destinationOut = { beginning: 1.0 };

      // Animate In
      // Only push parallel animations
      this.tweens.push(
        new TWEEN.Tween(this.shape)
          .parent(this.timeline || timeline)
          .to(this.destinationIn, this.duration)
          .easing(this.easingIn)
      );

      this.out = new TWEEN.Tween(this.shape)
        .parent(this.timeline || timeline)
        .to(this.destinationOut, this.duration / 4)
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

      var direction = Math.random() > 0.5;

      superclass.prototype.reset.call(this);

      this.shape.rotation = 0;

      this.destinationIn.rotation = Math.floor(Math.random() * 5 + 1.5) * Math.PI / 2;
      this.destinationIn.rotation *= direction ? - 1 : 1;
      this.shape.visible = false;

      this.radius = this.parent.height / 8;
      var variation = this.radius * animations.variation / 2;

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

      this.shape.scale = Math.random() * 2 + 1; // TODO: Parameterize with "variation"
      this.shape.scale *= Math.random() > 0.5 ? - 1 : 1;
      this.shape.scale *= TEMP.scale;

      this.shape.linewidth = this.thickness * TEMP.scale;

      if (this.shell === animations.Animation.Mode.fill || (this.shell === animations.Animation.Mode.random && Math.random() > 0.5)) {
        this.shape.fill = animations.white;
        this.shape.noStroke();
      } else {
        this.shape.noFill();
        this.shape.stroke = animations.white;
      }

      this.tweens[0].stop();
      this.out.stop();

      for (var i = 0, l = this.shape.vertices.length; i < l; i++) {
        var v = this.shape.vertices[i];
        var pct = i / (l - 1);
        var theta = pct * Math.PI;
        theta += direction ? - Math.PI / 2 : Math.PI / 2;
        var r = this.radius + variation * Math.random() - variation / 2;
        var x = r * Math.cos(theta);
        var y = r * Math.sin(theta);// - this.radius;
        v.set(x, y);
      }

      this.shape.ending = 1;
      this.shape.beginning = 1;
      delete this.destinationIn.ending;
      this.destinationIn.beginning = 0;
      delete this.destinationOut.beginning;
      this.destinationOut.ending = 0;

      this.tweens[0].to(this.destinationIn, this.duration);
      this.out.to(this.destinationOut, this.duration / 4);

      return this;

    },

    resize: function() {

      superclass.prototype.resize.call(this);

      return this;

    }

  });

  animations.register('HighBass', HighBass);

})();