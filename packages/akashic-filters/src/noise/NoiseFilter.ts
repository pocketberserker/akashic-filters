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

// https://github.com/pixijs/pixi.js/blob/v4.7.3/src/filters/noise/NoiseFilter.js

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision highp float;
varying vec2 vTexCoord;
varying vec4 vColor;
uniform sampler2D uSampler;

uniform float uNoise;
uniform float uSeed;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(uSampler, vTexCoord);
  float randomValue = rand(gl_FragCoord.xy * uSeed);
  float diff = (randomValue - 0.5) * uNoise;

  // Un-premultiply alpha before applying the color matrix. See issue #3539.
  if (color.a > 0.0) {
    color.rgb /= color.a;
  }

  color.r += diff;
  color.g += diff;
  color.b += diff;

  // Premultiply alpha again.
  color.rgb *= color.a;

  gl_FragColor = color;
}`;

export interface NoiseFilterOptions extends FilterParameterObject {
  noise?: number;
  seed?: number;
}

export class NoiseFilter extends Filter {
  constructor(options: NoiseFilterOptions) {
    super(options);
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        uNoise: {
          type: "float",
          value: "noise" in options ? options.noise : 0.5
        },
        uSeed: {
          type: "float",
          value: "seed" in options ? options.seed : Math.random()
        }
      }
    });
  }

  set noise(value) {
    this.shader.uniforms.uNoise.value = value;
  }

  get noise() {
    return this.shader.uniforms.uNoise.value;
  }

  set seed(value) {
    this.shader.uniforms.uSeed.value = value;
  }

  get seed() {
    return this.shader.uniforms.uSeed.value;
  }
}
