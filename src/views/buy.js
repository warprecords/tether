/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousBuy = root.Buy || {};

  var Buy = root.Buy = {

    id: 0,

    ready: function(f) {
      f();
      return Buy;
    },

    show: function(callback) {
      Buy.$elem.fadeIn(callback);
      return Buy;
    },

    hide: function() {
      Buy.$elem.fadeOut();
      return Buy;
    }

  };

})();