/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousStarfield = root.Starfield || {};
  var TEMP = {};

  var Starfield = root.Starfield = function(two, camera, options) {

    var params = _.defaults(options || {}, {
      amount: 20,
      minPoints: 3,
      maxPoints: 10,
      radius: 1,
      linewidth: 5,
      rotationVariation: 1,
      scaleVariation: 1,
      radiusVariation: 1,
      lineVariation: 1
    });

    this.amount = params.amount;
    this.minPoints = params.minPoints;
    this.maxPoints = params.maxPoints;
    this.radius = params.radius;

    this.camera = camera;
    this.two = two;

    this.items = _.map(_.range(this.amount), function(i) {

      var amt = Math.floor(Math.random() * (this.maxPoints - this.minPoints) + this.minPoints);
      var points = generatePoints(amt, Math.random() * this.radius * params.radiusVariation + this.radius);

      var shape = new Two.Polygon(points, true, Math.random() > 0.5);
      shape.linewidth = params.linewidth + params.lineVariation * Math.random();
      shape.thickness = shape.linewidth;
      shape.fill = animations.white;
      shape.stroke = 'rgba(255, 255, 255, 0.1)';

      shape.translation.set(two.width * Math.random(), two.height * Math.random());
      shape.translation.origin = new Two.Vector().copy(shape.translation);
      shape.opacity = this._opacity;

      shape.rotation = params.rotationVariation * Math.random() * Math.PI * 2;
      shape.scale = params.scaleVariation * Math.random() + 1;

      two.world.add(shape);

      return shape;

    }, this);

  };

  _.extend(Starfield.prototype, {

    _opacity: 0.0,

    enableSoundAnalysis: true,

    update: function(frequencies, length) {

      var ox = this.camera.translation._x / this.camera.zoom;
      var oy = this.camera.translation._y / this.camera.zoom;
      var width = this.two.width;
      var height = this.two.height;

      var top = oy;
      var left = ox;
      var right = ox + width * this.camera.zoom;
      var bottom = oy + height * this.camera.zoom;

      var horizontal = this.camera.translation.dx;
      var vertical = this.camera.translation.dy;

      var band;

      for (var i = 0; i < this.amount; i++) {

        var pct = i / this.amount;

        var shape = this.items[i];

        // Twinkle
        if (this.enableSoundAnalysis) {
          band = (frequencies[Math.floor(pct * length)]);
          shape.linewidth = band / 12 + shape.thickness;
        }

        if (this.camera.zoom !== 1) {
          continue;
        }

        // Calculate whether or not the item is offscreen
        // if it is then wrap it.

        if (horizontal < 0 && shape.translation.x < left) {
          shape.translation.x += width * 1.25;
        } else if (horizontal > 0 && shape.translation.x > right) {
          shape.translation.x -= width * 1.25;
        }

        if (vertical < 0 && shape.translation.y < top) {
          shape.translation.y += height * 1.25;
        } else if (vertical > 0 && shape.translation.y > bottom) {
          shape.translation.y -= height * 1.25;
        }

      }

      return this;

    },

    redistribute: function() {

      for (var i = 0; i < this.amount; i++) {

        // if visible continue
        // otherwise find a place for the item

        var shape = this.items[i];
        if (this.camera.inView(shape.translation)) {
          continue;
        }

        // assign to TEMP
        this.camera.getRandomVisibleVector(TEMP, true);
        shape.translation.copy(TEMP);

      }

      return this;

    },

    addTweens: function(timeline) {

      var scope = this;

      var t1 = new TWEEN.Tween(this)
        .to({ opacity: 1 }, 1000)
        .parent(timeline)
        .onStart(function() {
          scope.redistribute();
        })
        .start((1 * 60 + 56) * 1000);

      var t2 = new TWEEN.Tween(this)
        .to({ opacity: 0 }, 10000)
        .parent(timeline)
        .start((4 * 60 + 2) * 1000);

      return this;

    }

  });

  Object.defineProperty(Starfield.prototype, 'opacity', {
    get: function() {
      return this._opacity;
    },
    set: function(v) {
      this._opacity = v;
      for (var i = 0; i < this.amount; i++) {
        this.items[i].opacity = v;
      }
    }
  });

  function generatePoints(resolution, radius) {
    return _.map(_.range(resolution), function(i) {
      var pct = i / resolution;
      var theta = pct * Math.PI * 2;
      var x = radius * Math.cos(theta);
      var y = radius * Math.sin(theta);
      return new Two.Anchor(x, y);
    });
  }

})();