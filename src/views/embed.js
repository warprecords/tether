(function() {

  var root = this;
  var previousEmbed = root.Embed || {};

  var Embed = root.Embed = {

    id: 1,

    ready: function(f) {
      f();
      return Embed;
    },

    show: function(callback) {
      Embed.$elem.fadeIn(callback);
      return Embed;
    },

    hide: function() {
      Embed.$elem.fadeOut();
      return Embed;
    }

  };

})();