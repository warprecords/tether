/**
 * @jonobr1 / http://jonobr1.com/
 */

if (window.location.href.match('no-webgl') || has.mobile) {
  has.webgl = false;
}

/**
 * Global variables
 */
var two, $window, dragging = false, timeline = new TWEEN(), camera,
  currentSpeed = 1.0, frequencyData, grid, currentTime = 0, track,
  mouse = new Two.Vector();

$(function() {

  if (has.webgl) {
    _gaq.push(['_trackEvent', 'WebGL', 'Has']);
  } else {
    _gaq.push(['_trackEvent', 'WebGL', 'Has Not']);
  }

  /**
   * Scope specific variables
   */
  var soundClips, views = [Lobby, Experience, Share],
    modals = [Buy, Embed, About];

  var previousHash = window.location.hash, playing = false;

  var Router = Backbone.Router.extend({
    routes: {
      // In the navigation
      'buy(/)': 'buy',
      'embed(/)': 'embed',
      'about(/)': 'about',
      // Created by the experience
      'share(/)': 'share',
      // Default
      '*actions': 'defaultRoute'  // Backbone will try to match the other routes first
    }
  });

  var router = window.router = new Router()
    .on('route:buy', function() {
      // Buy modal
      _gaq.push(['_trackEvent', 'Router', 'Buy']);
      showModal(Buy.id);
    })
    .on('route:embed', function() {
      _gaq.push(['_trackEvent', 'Router', 'Embed']);
      showModal(Embed.id);
      Embed.$elem.find('.textarea').select();
    })
    .on('route:about', function() {
      // About modal
      _gaq.push(['_trackEvent', 'Router', 'About']);
      showModal(About.id);
    })
    .on('route:share', function() {
      // Share the experience
      _gaq.push(['_trackEvent', 'Router', 'Share']);
      Share.ready(function() {
        showView(Share.id);
      });
    })
    .on('route:defaultRoute', function() {
      // Loading experience
      _gaq.push(['_trackEvent', 'Router', 'Start']);
      showView(Lobby.id);
      // ready(Lobby.start);
    });

  var preload = function() {

    $window = $(window);

    Embed.$elem = $('#embed');
    Buy.$elem = $('#buy');
    About.$elem = $('#about');

    Lobby.$elem = $('#lobby');
    Experience.$elem = $('#stage');
    Share.$elem = $('#share');

    $('#buy-show').click(function(e) {
      router.navigate('#/buy', { trigger: true });
    });
    $('#embed-show').click(function(e) {
      router.navigate('#/embed', { trigger: true });
    });
    $('#about-show').click(function(e) {
      router.navigate('#/about', { trigger: true });
    });

    $('#replay-button').click(function(e) {
      e.preventDefault();
      window.location = window.location.href.replace(window.location.hash, '');
    });

    $('.close').each(function(i, elem) {
      var $elem = $(elem).click(function(e) {
        e.preventDefault();
        if (playing) {
          router.navigate(previousHash, { trigger: false });
          $elem.parent().fadeOut();
          return;
        }
        if (previousHash === window.location.hash) {
          router.navigate('#', { trigger: true });
          updateHash();
          return;
        }
        router.navigate(previousHash, { trigger: true });
        updateHash();
      });
    });

    $('.buy-link').each(function(i, elem) {
      var $elem = $(elem).click(function() {
        _gaq.push(['_trackEvent', 'Buy', $elem.attr('href')]);
      });
    });

    var $message = $('#controls .message');

    var fullyLoaded = _.after(views.length + modals.length, function() {
      Lobby.awaiting = true;
      preload.loaded = true;
      $message.html((has.mobile ? 'Tap' : 'Click') + ' to play.');
      _.each(preload.callbacks, function(f) {
        f();
      });
      preload.callbacks.length = 0;
    });

    var loaded = function() {
      // loadShare();
      updateLoader();
      fullyLoaded();
    };

    var updateLoader = function() {
      updateLoader.index++;
      var pct = updateLoader.index / (views.length + modals.length);
      Lobby.updateLoader(pct);
    };
    updateLoader.index = 0;

    Lobby.ready(function() {
      Lobby.start();
      loaded();
    });
    Experience.ready(loaded);
    Share.ready(loaded);

    Buy.ready(loaded);
    Embed.ready(loaded);
    About.ready(loaded);

    // Hook up connections and transitions

    Lobby.end = function() {
      _gaq.push(['_trackEvent', 'Router', 'Play']);
      playing = true;
      _.delay(function() {
        showView(Experience.id, Experience.play);
      }, 1000);
    };
    Experience.end = function() {
      playing = false;
      _gaq.push(['_trackEvent', 'Router', 'End']);
      _.delay(function() {
        router.navigate('#/share', { trigger: false });
        previousHash = '#/share';
      }, 1000);
    };

  };

  preload.loaded = false;
  preload.callbacks = [];

  ready(function() {

    $('#loading').fadeOut(function() {
      $('.post-load').each(function(i, elem) {
        elem.style.display = 'inline-block';
      });
    });

  });

  preload();

  Backbone.history.start();
  $('#content').fadeIn();


  function ready(f) {
    if (preload.loaded) {
      f();
      return;
    }
    if (_.indexOf(preload.callbacks, f) >= 0) {
      return;
    }
    preload.callbacks.push(f);
  }

  function showView(id, callback) {
    _.each(modals, function(modal) {
      modal.hide();
    });
    _.each(views, function(view) {
      if (view.id === id) {
        return;
      }
      view.hide();
    });
    views[id].show(callback);
  }

  function showModal(id, callback) {
    _.each(modals, function(modal) {
      if (modal.id === id) {
        return;
      }
      modal.hide();
    });
    modals[id].show(callback);
  }

  function updateHash() {
    var temp = previousHash;
    previousHash = window.location.hash;
    return temp;
  }

});