/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousAbout = root.About || {};

  var About = root.About = {

    id: 2,

    ready: function(f) {
      f();
      return About;
    },

    show: function(callback) {
      About.$elem.fadeIn(callback);
      return About;
    },

    hide: function() {
      About.$elem.fadeOut();
      return About;
    }

  };

})();