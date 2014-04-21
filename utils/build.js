// https://npmjs.org/package/node-minify

var path = require('path');
var compressor = require('node-minify');

var files = [
  path.resolve(__dirname, '../third-party/has.js'),
  path.resolve(__dirname, '../third-party/jquery.js'),
  path.resolve(__dirname, '../third-party/jquery-ajax-blob-arraybuffer.js'),
  path.resolve(__dirname, '../third-party/three.js'),
  path.resolve(__dirname, '../third-party/two.js'),
  path.resolve(__dirname, '../third-party/tween.js'),
  path.resolve(__dirname, '../third-party/backbone.js'),
  path.resolve(__dirname, '../src/animations.js'),
  path.resolve(__dirname, '../src/animations/bass.js'),
  path.resolve(__dirname, '../src/animations/hats.js'),
  path.resolve(__dirname, '../src/animations/high-bass.js'),
  path.resolve(__dirname, '../src/animations/drone.js'),
  path.resolve(__dirname, '../src/animations/whip.js'),
  path.resolve(__dirname, '../src/sound.js'),
  path.resolve(__dirname, '../src/effect.js'),
  path.resolve(__dirname, '../src/effects-view.js'),
  path.resolve(__dirname, '../src/playback.js'),
  path.resolve(__dirname, '../src/pool.js'),
  path.resolve(__dirname, '../src/zui.js'),
  path.resolve(__dirname, '../src/camera.js'),
  path.resolve(__dirname, '../src/starfield.js'),
  path.resolve(__dirname, '../src/trail.js'),
  path.resolve(__dirname, '../src/grid.js'),
  path.resolve(__dirname, '../src/views/lobby.js'),
  path.resolve(__dirname, '../src/views/experience.js'),
  path.resolve(__dirname, '../src/views/share.js'),
  path.resolve(__dirname, '../src/views/about.js'),
  path.resolve(__dirname, '../src/views/buy.js'),
  path.resolve(__dirname, '../src/views/embed.js'),
  path.resolve(__dirname, '../src/main.js')
];

// Concatenated
new compressor.minify({
  type: 'no-compress',
  fileIn: files,
  fileOut: path.resolve(__dirname, '../build/tether.js'),
  callback: function(e) {
    if (!e) {
      console.log('concatenation complete');
    } else {
      console.log('unable to concatenate', e);
    }
  }
});

// Minified
new compressor.minify({
  type: 'uglifyjs',
  fileIn: files,
  fileOut: path.resolve(__dirname, '../build/tether.min.js'),
  callback: function(e){
    if (!e) {
      console.log('minified complete');
    } else {
      console.log('unable to minify', e);
    }
  }
});
