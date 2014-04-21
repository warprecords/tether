/**
 * @jonobr1 / http://jonobr1.com/
 */

THREE.EffectsView = {

  initialize: function() {

    three = window.three = {

      renderer: new THREE.WebGLRenderer({ antialias: false }),
      camera: new THREE.OrthographicCamera(0, 1, 0, 1, 0, 1),
      scene: new THREE.Scene(),
      texture: new THREE.Texture(two.renderer.domElement),
      quad: new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial(TetherEffect)),

      vignette: 0,
      drag: 0.0033,

      initialized: false,

      init: function() {

        three.renderer.domElement.id = 'effects-view';

        three.quad.position.set(0.5, 0.5, 0.0);
        three.quad.rotation.y = Math.PI;
        three.quad.rotation.z = Math.PI;

        three.scene.add(three.camera);
        three.scene.add(three.quad);

        three.quad.material.uniforms.texture.value = three.texture;

        three.resize();
        three.initialized = true;

        three.addNoiseTweens();

        return three;
      },

      resize: function() {

        var width = $window.width();
        var height = $window.height();
        var ratio = Two.Utils.getRatio(two.renderer.domElement);

        three.renderer.setSize(width / ratio, height  / ratio);
        _.extend(three.renderer.domElement.style, {
          width: 100 + '%',
          height: 100 + '%'
        });
        three.quad.material.uniforms.dimensions.value.set(width / ratio, height / ratio);

        return three;

      },

      updateFrequency: function(frequencies, length) {

        // var low = frequencies[Math.floor(length * 0.25)] / 255;
        // var mid = frequencies[Math.floor(length * 0.50)] / 255;
        var high = Math.sqrt(frequencies[Math.floor(length * 0.75)] / 255);

        var max = three.quad.material.uniforms.noiseScale.max;
        var min = three.quad.material.uniforms.noiseScale.min;
        three.quad.material.uniforms.noiseScale.value = high * (max - min) + min;

        return three;

      },

      render: function(frameCount, timeDelta) {

        if (_.isUndefined(timeDelta)) {
          three.init();
          return three;
        }

        three.quad.material.uniforms.tick.value += (timeDelta / 60) * (window.currentSpeed || 1.0);

        if (three.quad.material.uniforms.vignette.value > 0.0001) {
          three.quad.material.uniforms.vignette.value += (0 - three.quad.material.uniforms.vignette.value) * three.drag * currentSpeed;
        }

        three.texture.needsUpdate = true;
        three.renderer.render(three.scene, three.camera);

        return three;

      },

      // Different modes of Animating the Effect

      emergency: function() {

        three.drag = 0.033;
        three.quad.material.uniforms.foreground.value.set(0.1, 1, 0.75);
        three.quad.material.uniforms.vignette.value = 8;

        return three;

      },

      addNoiseTweens: function() {

        var t1 = new TWEEN.Tween(three.quad.material.uniforms.noise)
          .to({ value: 1.0 }, 15 * 1000)
          .parent(timeline)
          .easing(TWEEN.Easing.Circular.Out)
          .onComplete(function() {
            t1.stop();
            this.value = 0;
          })
          .start((1 * 60 + 26) * 1000);

        var t2 = new TWEEN.Tween(three.quad.material.uniforms.noise)
          .to({ value: 0.5 }, 15 * 1000)
          .parent(timeline)
          .easing(TWEEN.Easing.Circular.Out)
          .onComplete(function() {
            t2.stop();
            this.value = 0;
          })
          .start((2 * 60 + 44) * 1000);

        var t3 = new TWEEN.Tween(three.quad.material.uniforms.noise)
          .to({ value: 2.0 }, 21 * 1000)
          .parent(timeline)
          .easing(TWEEN.Easing.Circular.Out)
          .onStart(function() {
            this.value = 0.33;
          })
          .start((3 * 60 + 7.5) * 1000);

        var t4 = new TWEEN.Tween(three.quad.material.uniforms.noise)
          .to({ value: 0 }, 10000)
          .parent(timeline)
          .start((4 * 60 + 2) * 1000);

      }

    };

    // document.body.appendChild(three.renderer.domElement);

    two.bind('resize', three.resize).bind('update', three.render);

    three.resize();

  }

};