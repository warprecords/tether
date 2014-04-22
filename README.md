# [Tether](http://tether.plaid.co.uk/)
__Tether__ is an interactive web application created by @jonobr1 in collaboration with [Plaid](http://plaid.co.uk). The track is accompanied by a series of graphic shapes that gradually evolve as the music progresses; you can manipulate what you hear by clicking and dragging your mouse — or, if watching on your smartphone or tablet, touching and dragging on the screen. _This repository holds all the assets and source code for the site [http://tether.plaid.co.uk](http://tether.plaid.co.uk)_.

## Setup
Because __Tether__ is a simple website, it's relatively easy to boot up and tinker with on your own machine. Since  the application relies on a number of asynchronous requests, you'll need to run a local server. We recommend Python's `SimpleHTTPServer`. If you have a Mac this is already installed. In addition to downloading the project.

### Local Server
1. Make sure [Python](https://wiki.python.org/moin/BeginnersGuide/Download) is installed.
2. [Download](https://github.com/warprecords/tether/archive/gh-pages.zip) / [Clone](https://help.github.com/articles/which-remote-url-should-i-use) this project.
3. Open a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
4. Type `cd path/to/tether/project`
5. Type `python -m SimpleHTTPServer`

The server will default to port `8000`. Open up a web browser and go to [`http://localhost:8000`](http://localhost:8000). You should see the Tether logo load and you have successfully setup your local server!

### Styling
The styling and layout of __Tether__ like all websites is built on css which you can find in the `styles` folder of the project. However, the project leverages two libraries in order to speed up designing: [SCSS](http://sass-lang.com/) and [Bourbon](http://bourbon.io/). Following these steps will allow you to edit the `styles/main.scss` file and automatically compile the `styles/main.css`. The `main.css` is the file actually used on the site, but `main.scss` affords some nice features like variables when writing css and mixins for css3 polyfill.

1. Make sure [Ruby](https://www.ruby-lang.org/en/installation/) is installed.
2. Open a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
3. Type `gem install scss`
4. Type `gem install bourbon`
5. Type `cd path/to/tether/project/styles`
6. Type `bourbon install`
7. Type `scss --watch .`

The final command initializes a script that __watches__ for when `.scss` files change and updates the `.css` counterpart. Read up on both [SCSS](http://sass-lang.com/) and [Bourbon](http://bourbon.io/) to familiarize yourself with the possibilities.

### JavaScript
The bulk of the "content" you see on the site is made with JavaScript. Tether relies on three emerging technologies on for the browser: Canvas2d, WebGL, and the Web Audio API. There is a `src` folder in the project that represent all the different modules and logic. They rely on JavaScript files in the `third-party` folder. Together these files get compiled into a concatenated `build/tether.js` file and a minified `build/tether.min.js` file.

_N.B: This project was concepted and developed on an accelerated timeline so the coherence and modularity is tenuous at best._

- __src__
  - __animations.js__ Singleton object that holds each prototypical animation.
  - __animations/__
    - __bass.js__
    - __drone.js__
    - __hats.js__
    - __high-bass.js__
    - __whip.js__
  - __camera.js__ Camera object for Two.js to conveniently move the scene.
  - __effect.js__ GLSL Fragment Shader for WebGL enabled browsers.
  - __effects-view.js__ Three.js Scene to take Two.js scene as a texture for WebGL enabled browsers.
  - __grid.js__ Class to dictate position of animations.
  - __main.js__ Handles all controllers and view logic.
  - __playback.js__ Class to manage when animations should play.
  - __pool.js__ Class to recycle and keep a hard limit on instantiated animations.
  - __sound.js__ Class to abstract Web Audio API into a friendly api.
  - __starfield.js__ Class to draw stars in the background.
  - __trail.js__ Class to draw user input.
  - __views/__ 
    - __about.js__
    - __buy.js__
    - __embed.js__
    - __experience.js__ The "music video" view.
    - __lobby.js__
    - __share.js__
  - __zui.js__ Dependency of Camera to do Google Maps style zooming and panning matrix transformations.

To recap in prose: `main.js` is executed on page load and dictates which view is visible and active. The views share a lot in common, but don't really have an underlying object or class that they inherit from. `lobby.js` and `experience.js` are where the bulk of the logic come from. `lobby.js` is responsible for the page with the Tether logo on it and `experience.js` is the "music video" portion of the project. `experience.js` leverages these other files, loading sounds adding additional interaction to the canvases, etc.. 

### Assets
In addition to imagery, Tether relies on a compiled JSON data object `data/triggers.json` to dictate when animations should fire. These values are a blend of midi data, sound processing, and analog recording. It also relies on audio files. There are two tracks, one at 120BPM and another at 40BPM. Lastly, there are `data/audio/clips` which are multi-second fragments from the stems to be used in `lobby.js`.

## Build Process
At the bottom of `index.html` there is a large commented out block of `script` tags. Uncomment this and comment out the `<script src="./build/tether.min.js"></script>` line in order to dev. This way you can edit individual files and refresh the page to see changes. However, if you've made changes that you'd like to minify then follow these steps:

1. Make sure [Node.js](http://nodejs.org/download/) is installed.
2. Open up a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
3. Type `cd path/to/tether/project`
4. Type `npm install node-minify`
5. Type `node ./utils/build`

This will update both the concatenated and minified files in `build/`.