/**
 * @jonobr1 / http://jonobr1.com/
 */

(function() {

  var root = this;
  var previousTetherEffect = root.TetherEffect || {};

  var TetherEffect = root.TetherEffect = {

    uniforms: {

      dimensions: { type: 'v2', value: new THREE.Vector2() },
      tick: { type: 'f', value: 0 },
      vignette: { type: 'f', value: 0.33 },
      frequency: { type: 'f', value: 2000.0, min: 50, max: 500 },
      frequencyScale: { type: 'f', value: 0 },
      noise: { type: 'f', value: 0 },
      noiseScale: { type: 'f', value: 500.0, min: 250, max: 100000 },
      dragging: { type: 'f', value: 0.0 },
      texture: { type: 't', value: null },
      foreground: { type: 'v3', value: new THREE.Vector3(1.0, 1.0, 1.0) },

      uScale: { type: 'f', value: 1.0 },
      uYrot: { type:'f', value: 0.0 }

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
      'uniform float frequency;',
      'uniform float frequencyScale;',
      'uniform float noise;',
      'uniform float noiseScale;',
      'uniform float dragging;',
      'uniform sampler2D texture;',
      'uniform vec3 foreground;',

      'uniform float uScale;',
      'uniform float uYrot;',

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

      // Anti-aliased step function. If the auto derivatives extension
      // is supported, the AA is done in a fully general, anisotropic
      // manner. If not, the expression for "afwidth" is a kludge for
      // this particular shader and this particular view transform.
      'float aastep(float threshold, float value) {',
        // Kludge: isotropic and hard-coded for canvas size 400 px
        'float afwidth = frequency * frequencyScale * (1.0 / 200.0) / uScale / cos(uYrot);',
        'return smoothstep(threshold-afwidth, threshold + afwidth, value);',
      '}',

      // Explicit bilinear texture lookup to circumvent bad hardware precision.
      // The extra arguments specify the dimension of the texture. (GLSL 1.30
      // introduced textureSize() to get that information from the sampler.)
      // "dims" is the width and height of the texture, "one" is 1.0/dims.
      // (Precomputing "one" saves two divisions for each lookup.)
      'vec4 texture2D_bilinear(sampler2D tex, vec2 st, vec2 dims, vec2 one) {',
        'vec2 uv = st * dims;',
        'vec2 uv00 = floor(uv - vec2(0.5)); // Lower left corner of lower left texel',
        'vec2 uvlerp = uv - uv00 - vec2(0.5); // Texel-local lerp blends [0,1]',
        'vec2 st00 = (uv00 + vec2(0.5)) * one;',
        'vec4 texel00 = texture2D(tex, st00);',
        'vec4 texel10 = texture2D(tex, st00 + vec2(one.x, 0.0));',
        'vec4 texel01 = texture2D(tex, st00 + vec2(0.0, one.y));',
        'vec4 texel11 = texture2D(tex, st00 + one);',
        'vec4 texel0 = mix(texel00, texel01, uvlerp.y); ',
        'vec4 texel1 = mix(texel10, texel11, uvlerp.y); ',
        'return mix(texel0, texel1, uvlerp.x);',
      '}',

      // 2D simplex noise

      // Description : Array- and textureless GLSL 2D simplex noise.
      // Author : Ian McEwan, Ashima Arts. Version: 20110822
      // Copyright (C) 2011 Ashima Arts. All rights reserved.
      // Distributed under the MIT License. See LICENSE file.
      // https://github.com/ashima/webgl-noise

      'vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
      // 'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
      'vec3 permute(vec3 x) { return mod289((( x * 34.0) + 1.0) * x); }',

      'float snoise(vec2 v) {',
        'const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0',
                            '0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)',
                           '-0.577350269189626,  // -1.0 + 2.0 * C.x',
                            '0.024390243902439); // 1.0 / 41.0',
        // First corner
        'vec2 i = floor(v + dot(v, C.yy) );',
        'vec2 x0 = v - i + dot(i, C.xx);',
        // Other corners
        'vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
        'vec4 x12 = x0.xyxy + C.xxzz;',
        'x12.xy -= i1;',
        // Permutations
        'i = mod289(i); // Avoid truncation effects in permutation',
        'vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))',
                                 '+ i.x + vec3(0.0, i1.x, 1.0 ));',
        'vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),',
                                'dot(x12.zw,x12.zw)), 0.0);',
        'm = m*m; m = m*m;',
        // Gradients
        'vec3 x = 2.0 * fract(p * C.www) - 1.0;',
        'vec3 h = abs(x) - 0.5;',
        'vec3 a0 = x - floor(x + 0.5);',
        // Normalise gradients implicitly by scaling m
        'm *= 1.792843 - 0.853735 * ( a0*a0 + h*h );',
        // Compute final noise value at P
        'vec3 g;',
        'g.x = a0.x * x0.x + h.x * x0.y;',
        'g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
        'return 130.0 * dot(m, g);',
      '}',

      'void main() { ',

        // time / speed / variation
        'float time = tick / 100.0;',
        'float cosine = cos(time);',
        'float sine = sin(time); ',

        'float radius = dimensions.y * 2.0;',
        'vec2 centroid = vec2(dimensions) / 2.0;',
        'vec2 pos = vUv * dimensions;',

        'vec2 st = vUv;',
        'st.y *= dimensions.y / dimensions.x;',

        // Color
        'vec4 f = vec4(foreground, 1.0);',
        'vec4 texel = texture2D(texture, vUv);',

        'float n = 0.1 * snoise(st * 200.0);',
        'n += 0.05 * snoise(st * 200.0);',
        'n += 0.025 * snoise(st * 800.0);',
        'vec3 white = vec3(n * 0.2 + 0.97);',
        'vec3 black = vec3(n * 1.0);',

        // The final result that will go to gl_FragColor
        'vec4 sum = vec4(0.0);',

        'vec2 metaballs[4];',
        'metaballs[0] = vec2(cosine * centroid.x + centroid.x, sine * centroid.y + centroid.y);',
        'metaballs[1] = vec2(cosine * centroid.x + centroid.x, sin(time * 0.25) * centroid.y + centroid.y);',
        'metaballs[2] = vec2(cos(time * 0.33) * centroid.x + centroid.x, sin(time * 1.5) * centroid.y + centroid.y);',
        'metaballs[3] = vec2(sine * centroid.x + centroid.x, cosine * centroid.y + centroid.y);',

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

        'sum += texel;',
        // Add Noise
        'sum += clamp(noise * cnoise(vec3(vUv.xy * noiseScale, tick)), 0.0, 1.0);',

        // Convert rgb texture color into CMYK
        'vec4 cmyk;',
        'cmyk.xyz = 1.0 - sum.rgb;',
        'cmyk.w = min(cmyk.x, min(cmyk.y, cmyk.z));',
        'cmyk.xyz -= cmyk.w;',

        // C component: 15 degrees screen angle
        'vec2 Cst = frequency * frequencyScale * mat2(0.966, - 0.259, 0.259, 0.966) * st;',
        'vec2 Cuv = 2.0 * fract(Cst) - 1.0;',
        'float c = aastep(0.0, sqrt(cmyk.x) - length(Cuv) + n);',

        // M component: -15 degrees screen angle
        'vec2 Mst = frequency * frequencyScale * mat2(0.966, 0.259, - 0.259, 0.966) * st;',
        'vec2 Muv = 2.0 * fract(Mst) - 1.0;',
        'float m = aastep(0.0, sqrt(cmyk.y) - length(Muv) + n);',

        // Y component: 0 degrees screen angle
        'vec2 Yst = frequency * frequencyScale * st;',
        'vec2 Yuv = 2.0 * fract(Yst) - 1.0;',
        'float y = aastep(0.0, sqrt(cmyk.z) - length(Yuv) + n);',

        // K component: 45 degrees screen angle
        'vec2 Kst = frequency * frequencyScale * mat2(0.707, -0.707, 0.707, 0.707) * st;',
        'vec2 Kuv = 2.0 * fract(Kst) - 1.0;',
        'float k = aastep(0.0, sqrt(cmyk.w) - length(Kuv) + n);',

        'vec3 rgbscreen = 1.0 - 0.9 * vec3(c, m, y);',
        'rgbscreen = mix(rgbscreen, black, k);',

        'float afwidth = frequency * frequencyScale * (1.0 / 200.0) / uScale / cos(uYrot);',
        'float blend = smoothstep(0.7, 1.4, afwidth); ',
        'vec4 result = vec4(mix(rgbscreen, sum.rgb, blend), 1.0);',

        // A final vignette added while dragging the mouse
        'gl_FragColor = mix(result, vec4(0.0), distance(vUv.xy, vec2(0.5, 0.5)) * dragging);',

      '}'

    ].join('\n')

  };

})();