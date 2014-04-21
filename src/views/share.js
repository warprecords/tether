/**
 * @jonobr1 / http://jonobr1.com/
 */

$(function() {

  var root = window;
  var previousShare = root.Share || {};

  var callbacks = [], $img;
  var img = document.createElement('img');
  img.onload = function() {
    Share.loaded();
  };
  img.src = './images/album.jpg';

  var loop = function() {
    if (!Share.playing) {
      return;
    }
    if (Math.random() > 0.66) {
      img.style.opacity = Math.random() * 0.33 + 0.66;
    }
    requestAnimationFrame(loop);
  };

  var resizeImage = function() {
    var smaller = Math.min($window.width(), $window.height());
    var bigger = Math.max($window.width(), $window.height());
    $img.css({
      position: 'absolute',
      display: 'block',
      marginLeft: - smaller / 2 + 'px',
      width: smaller + 'px',
      height: smaller + 'px',
      bottom: '0',
      left: 50 + '%'
    });
  };

  var Share = root.Share = {

    id: 2,

    _ready: false,
    _bound: false,

    loaded: function() {
      Share._ready = true;
      _.each(callbacks, function(c) {
        c();
      });
      callbacks.length = 0;
      return Share;
    },

    ready: function(f) {
      if (Share._ready) {
        f();
      }
      if (_.indexOf(callbacks, f) >= 0) {
        return Share;
      }
      callbacks.push(f);
      return Share;
    },

    show: function(callback) {
      Share.initialize();
      Share.play();
      Share.bind();
      Share.$elem.css('display', 'block');
      _.defer(function() {
        Share.$elem.addClass('zoom-out');
      });
      return Share;
    },

    hide: function() {
      Share.$elem.fadeOut(function() {
        Share.pause();
        Share.unbind();
        Share.$elem.removeClass('zoom-out');
      });
      return Share;
    },

    initialize: function() {
      if (Share.init) {
        return Share;
      }

      Share.$elem.find('#album-cover').append(img);
      $img = $(img);

      return Share;
    },

    play: function() {
      if (Share.playing) {
        return Share;
      }
      Share.playing = true;
      loop();
      return Share;
    },

    pause: function() {
      Share.playing = false;
      return Share;
    },

    bind: function() {
      if (Share._bound) {
        return Share;
      }
      Share._bound = true;
      $window.bind('resize', resizeImage);
      resizeImage();
    },

    unbind: function() {
      Share._bound = false;
      $window.unbind('resize', resizeImage);
    }

  };

});