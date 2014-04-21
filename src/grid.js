(function() {

  var root = this;
  var previousGrid = root.Grid || {};
  var destinations = [0, 1, 2, 3, 2, 3, 0, 4];
  var index = 0;

  var Grid = root.Grid = function(cols, rows, camera) {

    this.amount = Math.round(cols * rows);

    var row = 0, col = 0;

    this.camera = camera;

    if (cols < 0 || rows < 0) {

      this.amount = 1;
      this.cells = [new RandomVector()];
      return;

    }

    this.cells = _.map(_.range(this.amount), function(i) {

      // Calculate center of cell
      var x = (col / cols) + (1 / cols) / 2;
      var y = (row / rows) + (1 / rows) / 2;

      col++;

      if (col >= cols) {
        col = 0;
        row++;
      }

      var vector = new Two.Vector(x, y);
      vector.index = i;

      return vector;

    });

  };

  _.extend(Grid.prototype, {

    amount: 0,

    index: 0,

    next: function() {
      return this.set(this.index + 1);
    },

    previous: function() {
      return this.set(this.index - 1);
    },

    random: function() {
      return this.set(Math.floor(Math.random() * this.amount));
    },

    set: function(i) {
      this.index = mod(i, this.amount);
      return this;
    },

    get: function(obj) {
      return this.camera.percentageToWorld(this.cells[this.index], obj);
    }

  });

  var GridMode = root.GridMode = function(camera) {

    this.a = new Grid(1, 1, camera);
    this.b = new Grid(2, 1, camera);
    this.c = new Grid(4, 4, camera);
    this.d = new Grid(8, 8, camera);
    this.e = new Grid(-1, -1, camera);

    this.list = [this.a, this.b, this.c, this.d, this.e];
    this.length = this.list.length;

    this.active = this.a;
    this.index = 0;

    this.camera = camera;

  };

  _.extend(GridMode.prototype, {

    next: function() {
      return this.select(this.index + 1);
    },

    previous: function() {
      return this.select(this.index - 1);
    },

    select: function(i) {
      this.index = mod(i, this.length);
      this.active = this.list[this.index];
      return this;
    },

    nextDestination: function() {
      index = (index + 1) % destinations.length;
      this.select(destinations[index]);
    }

  });

  var RandomVector = function() {};

  Object.defineProperty(RandomVector.prototype, 'x', {
    get: function() {
      return Math.random();
    },
    set: _.identity
  });
  Object.defineProperty(RandomVector.prototype, 'y', {
    get: function() {
      return Math.random();
    },
    set: _.identity
  });

  function mod(v, l) {
    while (v < 0) {
      v += l;
    }
    return v % l;
  }

})();