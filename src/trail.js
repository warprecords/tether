(function() {

  var root = this;
  var previousTrail = root.Trail || {};
  var TEMP = new Two.Vector();

  var colors = [
    'rgba(237, 151, 52, 0.1)',
    'rgba(68, 133, 151, 0.1)',
    'rgba(135, 177, 127, 0.1)',
    'rgba(182, 94, 58, 0.1)'
  ];
  var index = 0;

  var Trail = root.Trail = function(two, resolution) {

    this.resolution = _.isNumber(resolution) ? resolution : 60;
    this.vertices = _.map(_.range(this.resolution), function(i) {
      var anchor = new Two.Anchor();
      anchor.origin = new Two.Vector();
      return anchor;
    });
    this.shape = two.makeCurve(this.vertices, true);
    this.shape.stroke = 'rgb(255, 255, 255)';
    this.shape.noFill();
    this.shape.cap = 'round';
    this.shape.linewidth = 0.5;

    this.outline = two.makeCurve(this.vertices, true);
    this.outline.stroke = 'rgba(255, 0, 75, 0.1)';
    this.outline.noFill();
    this.outline.cap = 'round';
    this.outline.linewidth = 50;

  };

  _.extend(Trail.prototype, {

    frameCount: 0,

    variation: 10,

    drag: 0.33,

    start: function(x, y) {

      this.outline.stroke = colors[index % colors.length];

      for (var i = 0; i < this.resolution; i++) {
        this.vertices[i].origin.set(x, y);
        this.vertices[i].copy(this.vertices[i].origin);
      }

      index++;

      return this;

    },

    move: function(x, y) {

      for (var i = this.resolution - 1; i >= 0; i--) {
        if (i <= 0) {
          this.vertices[i].origin.set(x, y);
          continue;
        }
        this.vertices[i].origin.copy(this.vertices[i - 1].origin);
      }

      return this;

    },

    update: function(frequencies, length) {

      this.frameCount++;

      if (!this.initialized) {
        return this;
      }

      var x, y, pct, amplitude;

      for (var i = 0; i < this.resolution; i++) {

        pct = i / this.resolution;
        amplitude = Math.sqrt(frequencies[Math.floor(pct * length)] / 255);

        x = (Math.random() * this.variation - this.variation / 2) * amplitude;
        y = (Math.random() * this.variation - this.variation / 2) * amplitude;

        this.vertices[i]
          .addSelf(
            TEMP
              .copy(this.vertices[i].origin)
              .subSelf(this.vertices[i])
              .multiplyScalar(this.drag)
          );

        TEMP.set(x, y);

        this.vertices[i].addSelf(TEMP);

      }

      if (!this.shape.visible) {
        this.shape.visible = true;
        this.outline.visible = true;
      }

      return this;

    },

    release: function() {

      this.shape.visible = false;
      this.outline.visible = false;

      this.initialized = false;

      return this;

    }

  });

})();