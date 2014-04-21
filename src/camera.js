/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousCamera = root.Camera || {};
  var TEMP = new Two.Vector();

  var m = 8;
  var index = 0;
  var destinations = [
    0, 0,
    m * 4, 0,
    0, m * 4,
    m * 4, 0,
    0, m * 4,
    m * 4, 0,
    0, m * 4,
    m * 4, 0,
    0, m * 4,

    // Change mode here
    m * 1.1, 0,
    0, m * 1.2,
    m * 1.3, 0,
    0, m * 1.4,
    m * 1.5, 0,
    0, m * 1.6,
    m * 1.7, 0,
    // 0, m * 1.8,
    // m * 1.9, 0,
    // start calm
    0, 0,
    0, 0,
    0, 0,
    0, 0,
    0, 0,
    // end calm
    m * 1.1, 0,
    0, m * 1.2,
    m * 1.3, 0,
    0, m * 1.4,
    m * 1.5, 0,
    0, m * 1.6,
    m * 1.7, 0,
    0, m * 1.8,
    m * 1.9, 0,
    0, m * 1.9,
    m * 2.0, 0,
    0, m
  ];

  var Camera = root.Camera = function(two, minZoom, maxZoom, surface) {

    this.zui = new ZUI(two, surface);

    this.velocity = new Two.Vector();

    this.translation = new Two.Vector()
      .bind(Two.Events.change, _.bind(this._translate, this));

    this.translation._state = new Two.Vector();
    this.translation.dx = this.translation.dy = 0;

    this.limits = {
      min: minZoom,
      max: maxZoom
    };

    this.zui.addLimits(minZoom, maxZoom);

    this.two = two;

  };

  _.extend(Camera, ZUI, {

    Modes: {
      coast: 'coast',
      cruise: 'cruise'
    }

  });

  _.extend(Camera.prototype, ZUI.prototype, {

    _zoom: 1,

    mode: Camera.Modes.coast,

    drag: 0.125,

    _translate: function() {
      var dx = this.translation.dx = this.translation._state.x - this.translation._x;
      var dy = this.translation.dy = this.translation._state.y - this.translation._y;
      this.zui.translateSurface(dx, dy);
      this.zui.updateSurface();
      this.translation._state.copy(this.translation);
      return this;
    },

    zoomBy: function(ds, x, y) {

      this.zui.zoomBy(ds, x, y);
      this._zoom = this.zui.surfaceMatrix.elements[0];

      // TODO: Necessary?
      this.translation._x = - this.zui.surfaceMatrix.elements[2];
      this.translation._y = - this.zui.surfaceMatrix.elements[5];
      this.translation.dx = this.translation._state.x - this.translation._x;
      this.translation.dy = this.translation._state.y - this.translation._y;
      this.translation._state.copy(this.translation);

      return this;
    },

    zoomSet: function(z, x, y) {

      this._zoom = z;
      this.zui.zoomSet(z, x, y);

      // Update translation
      this.translation._x = - this.zui.surfaceMatrix.elements[2];
      this.translation._y = - this.zui.surfaceMatrix.elements[5];
      this.translation.dx = this.translation._state.x - this.translation._x;
      this.translation.dy = this.translation._state.y - this.translation._y;
      this.translation._state.copy(this.translation);

      return this;
    },

    percentageToWorld: function(obj, assignTo) {

      var scale = 1 / this._zoom;
      var width = this.two.width;
      var height = this.two.height;

      var x = obj.x * width;
      x += this.translation._x;
      x *= scale;

      var y = obj.y * height;
      y += this.translation._y;
      y *= scale;

      if (_.isObject(assignTo)) {
        assignTo.x = x;
        assignTo.y = y;
        assignTo.scale = scale;
        return assignTo;
      }

      return { x: x, y: y, scale: scale };

    },

    getRandomVisibleVector: function(obj, forceScaling) {

      var scale = 1 / this._zoom;
      var width = this.two.width + this.velocity.x;
      var height = this.two.height + this.velocity.y;

      var x = (Math.random() * width);
      if (!!forceScaling) {
        x /= scale;
      }
      x += this.translation._x;
      x *= scale;

      var y = (Math.random() * height);
      if (!!forceScaling) {
        y /= scale;
      }
      y += this.translation._y;
      y *= scale;

      if (_.isObject(obj)) {
        obj.x = x;
        obj.y = y;
        obj.scale = scale;
        return obj;
      }

      return { x: x, y: y, scale: scale };

    },

    getCentroidVector: function(obj) {

      var scale = 1 / this._zoom;
      var width = this.two.width;
      var height = this.two.height;

      var x = (width / 2);
      x += this.translation._x;
      x *= scale;

      var y = (height / 2);
      y += this.translation._y;
      y *= scale;

      if (_.isObject(obj)) {
        obj.x = x;
        obj.y = y;
        obj.scale = scale;
        return obj;
      }

      return { x: x, y: y, scale: scale };

    },

    inView: function(pos, zoom) {

      var scale = 1 / (zoom || this._zoom);

      var x = pos.x;
      var y = pos.y;

      var left = this.translation._x * scale;
      var right = (this.translation._x + this.two.width) * scale;

      var top = this.translation._y * scale;
      var bottom = (this.translation._y + this.two.height) * scale;

      return x > left && x < right && y > top && y < bottom;

    },

    nextVelocityDestination: function() {
      index = (index + 2) % destinations.length;
      this.velocity.set(destinations[index], destinations[index + 1]);
      return this;
    },

    updateTranslation: function() {

      var drag = this.drag * (currentSpeed || 1);

      switch (this.mode) {
        case Camera.Modes.coast:
          this.velocity.x = Math.max(this.velocity.x - this.velocity.x * drag, 0);
          this.velocity.y = Math.max(this.velocity.y - this.velocity.y * drag, 0);
          break;
        case Camera.Modes.cruise:
          break;
      }

      this.translation.addSelf(this.velocity);
      return this;

    }

  });

  Object.defineProperty(Camera.prototype, 'zoom', {
    get: function() {
      return this._zoom;
    },
    set: function(v) {
      this.zoomSet(v, this.two.width / 2, this.two.height / 2);
    }
  });

})();