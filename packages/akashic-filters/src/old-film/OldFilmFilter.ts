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

// https://github.com/pixijs/pixi-filters/blob/v2.6.1/filters/old-film/src/OldFilmFilter.js

import {Filter} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec2 dimensions;

uniform float sepia;
uniform float noise;
uniform float noiseSize;
uniform float scratch;
uniform float scratchDensity;
uniform float scratchWidth;
uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;
uniform float seed;

const float SQRT_2 = 1.414213;
const vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 Overlay(vec3 src, vec3 dst)
{
    // if (dst <= 0.5) then: 2 * src * dst
    // if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)
    return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),
                (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),
                (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));
}


void main()
{
    gl_FragColor = texture2D(uSampler, vTexCoord);
    vec3 color = gl_FragColor.rgb;

    if (sepia > 0.0)
    {
        float gray = (color.x + color.y + color.z) / 3.0;
        vec3 grayscale = vec3(gray);

        color = Overlay(SEPIA_RGB, grayscale);

        color = grayscale + sepia * (color - grayscale);
    }

    vec2 coord = vTexCoord * filterArea.xy / dimensions.xy;

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        vec2 dir = vec2(vec2(0.5, 0.5) - coord);
        dir.y *= dimensions.y / dimensions.x;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    if (scratchDensity > seed && scratch != 0.0)
    {
        float phase = seed * 256.0;
        float s = mod(floor(phase), 2.0);
        float dist = 1.0 / scratchDensity;
        float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));
        if (d < seed * 0.6 + 0.4)
        {
            highp float period = scratchDensity * 10.0;

            float xx = coord.x * period + phase;
            float aa = abs(mod(xx, 0.5) * 4.0);
            float bb = mod(floor(xx / 0.5), 2.0);
            float yy = (1.0 - bb) * aa + bb * (2.0 - aa);

            float kk = 2.0 * period;
            float dw = scratchWidth / dimensions.x * (0.75 + seed);
            float dh = dw * kk;

            float tine = (yy - (2.0 - dh));

            if (tine > 0.0) {
                float _sign = sign(scratch);

                tine = s * tine / period + scratch + 0.1;
                tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);

                color.rgb *= tine;
            }
        }
    }

    if (noise > 0.0 && noiseSize > 0.0)
    {
        vec2 pixelCoord = vTexCoord.xy * filterArea.xy;
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        // vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);
        // float _noise = snoise(d) * 0.5;
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        color += _noise * noise;
    }

    gl_FragColor.rgb = color;
}`;

export interface OldFilmFilterOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  sepia?: number;
  noise?: number;
  noiseSize?: number;
  scratch?: number;
  scratchDensity?: number;
  scratchWidth?: number;
  vignetting?: number;
  vignettingAlpha?: number;
  vignettingBlur?: number;
  seed?: number;
}

export class OldFilmFilter implements Filter {
  private shader: g.ShaderProgram;
  private dimensions: Float32Array;
  private filterArea: Float32Array;

  constructor(options: OldFilmFilterOptions) {
    this.dimensions = new Float32Array(2);
    this.filterArea = new Float32Array(4);
    this.move(options.x, options.y);
    this.resize(options.width, options.height);
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        filterArea: {
          type: "vec4",
          value: this.filterArea
        },
        dimensions: {
          type: "vec2",
          value: this.dimensions
        },
        sepia: {
          type: "float",
          value: "sepia" in options ? options.sepia : 0.3
        },
        noise: {
          type: "float",
          value: "noise" in options ? options.noise : 0.3
        },
        noiseSize: {
          type: "float",
          value: "noiseSize" in options ? options.noiseSize : 1.0
        },
        scratch: {
          type: "float",
          value: "scratch" in options ? options.scratch : 0.5
        },
        scratchDensity: {
          type: "float",
          value: "scratchDensity" in options ? options.scratchDensity : 0.3
        },
        scratchWidth: {
          type: "float",
          value: "scratchWidth" in options ? options.scratchWidth : 1.0
        },
        vignetting: {
          type: "float",
          value: "vignetting" in options ? options.vignetting : 0.3
        },
        vignettingAlpha: {
          type: "float",
          value: "vignettingAlpha" in options ? options.vignettingAlpha : 1.0
        },
        vignettingBlur: {
          type: "float",
          value: "vignettingBlur" in options ? options.vignettingBlur : 0.3
        },
        seed: {
          type: "float",
          value: "seed" in options ? options.seed : 0
        }
      }
    });
  }

  apply(renderer: g.Renderer): void {
    renderer.setShaderProgram(this.shader);
  }

  set sepia(value) {
    this.shader.uniforms.sepia.value = value;
  }

  get sepia() {
    return this.shader.uniforms.sepia.value;
  }

  set noise(value) {
    this.shader.uniforms.noise.value = value;
  }

  get noise() {
    return this.shader.uniforms.noise.value;
  }

  set noiseSize(value) {
    this.shader.uniforms.noiseSize.value = value;
  }

  get noiseSize() {
    return this.shader.uniforms.noiseSize.value;
  }

  set scratch(value) {
    this.shader.uniforms.scratch.value = value;
  }

  get scratch() {
    return this.shader.uniforms.scratch.value;
  }

  set scratchDensity(value) {
    this.shader.uniforms.scratchDensity.value = value;
  }

  get scratchDensity() {
    return this.shader.uniforms.scratchDensity.value;
  }

  set scratchWidth(value) {
    this.shader.uniforms.scratchWidth.value = value;
  }

  get scratchWidth() {
    return this.shader.uniforms.scratchWidth.value;
  }

  set vignetting(value) {
    this.shader.uniforms.vignetting.value = value;
  }

  get vignetting() {
    return this.shader.uniforms.vignetting.value;
  }

  set vignettingAlpha(value) {
    this.shader.uniforms.vignettingAlpha.value = value;
  }

  get vignettingAlpha() {
    return this.shader.uniforms.vignettingAlpha.value;
  }

  set vignettingBlur(value) {
    this.shader.uniforms.vignettingBlur.value = value;
  }

  get vignettingBlur() {
    return this.shader.uniforms.vignettingBlur.value;
  }

  set seed(value) {
    this.shader.uniforms.seed.value = value;
  }

  get seed() {
    return this.shader.uniforms.seed.value;
  }

  move(x: number, y: number) {
    this.filterArea[2] = x;
    this.filterArea[3] = y;
  }

  resize(width: number, height: number) {
    this.dimensions[0] = this.filterArea[0] = width;
    this.dimensions[1] = this.filterArea[1] = height;
  }
}
