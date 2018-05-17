/*
The MIT License

Copyright (c) 2013-2017 Mathew Groves, Chad Engler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// https://github.com/pixijs/pixi.js/blob/v4.7.3/src/filters/colormatrix/colorMatrix.frag

export function colorMatrix(m: string[]) {
  return `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform float uAlpha;

void main(void) {
  vec4 c = texture2D(uSampler, vTexCoord);

  if (uAlpha == 0.0) {
    gl_FragColor = c;
    return;
  }

  // Un-premultiply alpha before applying the color matrix. See issue #3539.
  if (c.a > 0.0) {
    c.rgb /= c.a;
  }

  vec4 result;

  result.r = (${m[0]} * c.r);
  result.r += (${m[1]} * c.g);
  result.r += (${m[2]} * c.b);
  result.r += (${m[3]} * c.a);
  result.r += ${m[4]};

  result.g = (${m[5]} * c.r);
  result.g += (${m[6]} * c.g);
  result.g += (${m[7]} * c.b);
  result.g += (${m[8]} * c.a);
  result.g += ${m[9]};

  result.b = (${m[10]} * c.r);
  result.b += (${m[11]} * c.g);
  result.b += (${m[12]} * c.b);
  result.b += (${m[13]} * c.a);
  result.b += ${m[14]};

  result.a = (${m[15]} * c.r);
  result.a += (${m[16]} * c.g);
  result.a += (${m[17]} * c.b);
  result.a += (${m[18]} * c.a);
  result.a += ${m[19]};

  vec3 rgb = mix(c.rgb, result.rgb, uAlpha);

  // Premultiply alpha again.
  rgb *= result.a;

  gl_FragColor = vec4(rgb, result.a);
}`;
}
