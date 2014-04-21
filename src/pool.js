/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousPool = root.Pool || {};

  var Pool = root.Pool = function(struct, size, parent) {

    this.struct = struct;
    this.length = size;
    this.index = 0;

    this.list = _.map(_.range(size), function(i) {
      return new struct(parent);
    });

  };

  _.extend(Pool.prototype, {

  });

  Object.defineProperty(Pool.prototype, 'active', {

    get: function() {
      var active = this.list[this.index]; 
      this.index = (this.index + 1) % this.length;
      return active;
    }

  });

})();