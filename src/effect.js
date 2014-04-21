(function() {

  var root = this;
  var previousTetherEffect = root.TetherEffect || {};

  var TetherEffect = root.TetherEffect = {

    uniforms: {

      dimensions: { type: 'v2', value: new THREE.Vector2() },
      tick: { type: 'f', value: 0 },
      vignette: { type: 'f', value: 0.33 },
      noise: { type: 'f', value: 0 },
      noiseScale: { type: 'f', value: 500.0, min: 250, max: 100000 },
      dragging: { type: 'f', value: 0.0 },
      texture: { type: 't', value: null },
      foreground: { type: 'v3', value: new THREE.Vector3(1.0, 1.0, 1.0) },

    },

    vertexShader: [

    'varying vec2 vUv;',

    'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '} '

    ].join('\n'),

    fragmentShader: [

      'uniform vec2 dimensions;',
      'uniform float tick;',
      'uniform float vignette;',
      'uniform float noise;',
      'uniform float noiseScale;',
      'uniform float dragging;',
      'uniform sampler2D texture;',
      'uniform vec3 foreground;',

      'varying vec2 vUv;',

      // GLSL textureless classic 3D noise "cnoise",
      // with an RSL-style periodic variant "pnoise".
      // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
      // Version: 2011-10-11
      //
      // Many thanks to Ian McEwan of Ashima Arts for the
      // ideas for permutation and gradient selection.
      //
      // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
      // Distributed under the MIT license. See LICENSE file.
      // https://github.com/ashima/webgl-noise
      //

      'vec3 mod289(vec3 x) {',
        'return x - floor(x * (1.0 / 289.0)) * 289.0;',
      '}',

      'vec4 mod289(vec4 x) {',
        'return x - floor(x * (1.0 / 289.0)) * 289.0;',
      '}',

      'vec4 permute(vec4 x) {',
        'return mod289(((x*34.0)+1.0)*x);',
      '}',

      'vec4 taylorInvSqrt(vec4 r) {',
        'return 1.79284291400159 - 0.85373472095314 * r;',
      '}',

      'vec3 fade(vec3 t) {',
        'return t*t*t*(t*(t*6.0-15.0)+10.0);',
      '}',

      // Classic Perlin noise
      'float cnoise(vec3 P) {',
        'vec3 Pi0 = floor(P); // Integer part for indexing',
        'vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1',
        'Pi0 = mod289(Pi0);',
        'Pi1 = mod289(Pi1);',
        'vec3 Pf0 = fract(P); // Fractional part for interpolation',
        'vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0',
        'vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);',
        'vec4 iy = vec4(Pi0.yy, Pi1.yy);',
        'vec4 iz0 = Pi0.zzzz;',
        'vec4 iz1 = Pi1.zzzz;',

        'vec4 ixy = permute(permute(ix) + iy);',
        'vec4 ixy0 = permute(ixy + iz0);',
        'vec4 ixy1 = permute(ixy + iz1);',

        'vec4 gx0 = ixy0 * (1.0 / 7.0);',
        'vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;',
        'gx0 = fract(gx0);',
        'vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);',
        'vec4 sz0 = step(gz0, vec4(0.0));',
        'gx0 -= sz0 * (step(0.0, gx0) - 0.5);',
        'gy0 -= sz0 * (step(0.0, gy0) - 0.5);',

        'vec4 gx1 = ixy1 * (1.0 / 7.0);',
        'vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;',
        'gx1 = fract(gx1);',
        'vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);',
        'vec4 sz1 = step(gz1, vec4(0.0));',
        'gx1 -= sz1 * (step(0.0, gx1) - 0.5);',
        'gy1 -= sz1 * (step(0.0, gy1) - 0.5);',

        'vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);',
        'vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);',
        'vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);',
        'vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);',
        'vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);',
        'vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);',
        'vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);',
        'vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);',

        'vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));',
        'g000 *= norm0.x;',
        'g010 *= norm0.y;',
        'g100 *= norm0.z;',
        'g110 *= norm0.w;',
        'vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));',
        'g001 *= norm1.x;',
        'g011 *= norm1.y;',
        'g101 *= norm1.z;',
        'g111 *= norm1.w;',

        'float n000 = dot(g000, Pf0);',
        'float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));',
        'float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));',
        'float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));',
        'float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));',
        'float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));',
        'float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));',
        'float n111 = dot(g111, Pf1);',

        'vec3 fade_xyz = fade(Pf0);',
        'vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);',
        'vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);',
        'float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ',
        'return 2.2 * n_xyz;',
      '}',

      // Classic Perlin noise, periodic variant
      'float pnoise(vec3 P, vec3 rep) {',
        'vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period',
        'vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period',
        'Pi0 = mod289(Pi0);',
        'Pi1 = mod289(Pi1);',
        'vec3 Pf0 = fract(P); // Fractional part for interpolation',
        'vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0',
        'vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);',
        'vec4 iy = vec4(Pi0.yy, Pi1.yy);',
        'vec4 iz0 = Pi0.zzzz;',
        'vec4 iz1 = Pi1.zzzz;',

        'vec4 ixy = permute(permute(ix) + iy);',
        'vec4 ixy0 = permute(ixy + iz0);',
        'vec4 ixy1 = permute(ixy + iz1);',

        'vec4 gx0 = ixy0 * (1.0 / 7.0);',
        'vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;',
        'gx0 = fract(gx0);',
        'vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);',
        'vec4 sz0 = step(gz0, vec4(0.0));',
        'gx0 -= sz0 * (step(0.0, gx0) - 0.5);',
        'gy0 -= sz0 * (step(0.0, gy0) - 0.5);',

        'vec4 gx1 = ixy1 * (1.0 / 7.0);',
        'vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;',
        'gx1 = fract(gx1);',
        'vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);',
        'vec4 sz1 = step(gz1, vec4(0.0));',
        'gx1 -= sz1 * (step(0.0, gx1) - 0.5);',
        'gy1 -= sz1 * (step(0.0, gy1) - 0.5);',

        'vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);',
        'vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);',
        'vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);',
        'vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);',
        'vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);',
        'vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);',
        'vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);',
        'vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);',

        'vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));',
        'g000 *= norm0.x;',
        'g010 *= norm0.y;',
        'g100 *= norm0.z;',
        'g110 *= norm0.w;',
        'vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));',
        'g001 *= norm1.x;',
        'g011 *= norm1.y;',
        'g101 *= norm1.z;',
        'g111 *= norm1.w;',

        'float n000 = dot(g000, Pf0);',
        'float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));',
        'float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));',
        'float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));',
        'float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));',
        'float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));',
        'float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));',
        'float n111 = dot(g111, Pf1);',

        'vec3 fade_xyz = fade(Pf0);',
        'vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);',
        'vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);',
        'float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ',
        'return 2.2 * n_xyz;',
      '}',

      // END CLASSIC PERLIN NOISE

      'void main() { ',

        // time / speed / variation
        'float time = tick / 100.0;',
        'float c = cos(time);',
        'float s = sin(time); ',

        'float radius = dimensions.y * 2.0;',
        'vec2 centroid = vec2(dimensions) / 2.0;',
        'vec2 pos = vUv * dimensions;',

        // colors
        'vec4 f = vec4(foreground, 1.0);',
        // 'vec4 b = vec4(background, 1.0);',

        'vec4 sum = vec4(0.0);',

        'vec2 metaballs[4];',
        'metaballs[0] = vec2(c * centroid.x + centroid.x, s * centroid.y + centroid.y);',
        'metaballs[1] = vec2(c * centroid.x + centroid.x, sin(time * 0.25) * centroid.y + centroid.y);',
        'metaballs[2] = vec2(cos(time * 0.33) * centroid.x + centroid.x, sin(time * 1.5) * centroid.y + centroid.y);',
        'metaballs[3] = vec2(s * centroid.x + centroid.x, c * centroid.y + centroid.y);',

        // Add all the metaball data up
        'for (int i = 0; i < 4; i++) {',
          'sum += mix(sum, f, radius / distance(pos.xy, metaballs[i].xy));',
        '}',

        // Smooth out contrasts in metaballs
        'float t = (sum.r + sum.g + sum.b) / 3.0;',
        'sum = mix(f, sum, t);',
        'sum = 1.0 - pow(sum, vec4(0.1));',
        'sum *= vignette;',

        // Dampen the super dark portions
        'sum = clamp(sum, vec4(0.0), vec4(1.0));',

        // Add Noise
        'float n = clamp(noise * cnoise(vec3(vUv.xy * noiseScale, tick)), 0.0, 1.0);',
        // 'n = mix(0.0, n, (1.0 - dragging) * distance(vUv.xy, vec2(0.5, 0.5))) / 2.0;',

        'sum += texture2D(texture, vUv);',
        'sum += n;',

        // A final vignette added while dragging the mouse
        'gl_FragColor = mix(sum, vec4(0.0), distance(vUv.xy, vec2(0.5, 0.5)) * dragging);',

      '}'

    ].join('\n')

  };

})();