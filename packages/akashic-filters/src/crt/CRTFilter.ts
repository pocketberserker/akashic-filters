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

// https://github.com/pixijs/pixi-filters/tree/v3.0.3/filters/ascii

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;

uniform vec4 filterArea;
uniform vec2 dimensions;

const float SQRT_2 = 1.414213;

const float light = 1.0;

uniform float curvature;
uniform float lineWidth;
uniform float lineContrast;
uniform bool verticalLine;
uniform float noise;
uniform float noiseSize;

uniform float vignetting;
uniform float vignettingAlpha;
uniform float vignettingBlur;

uniform float seed;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void)
{
    vec2 pixelCoord = vTexCoord.xy * filterArea.xy;
    vec2 coord = pixelCoord / dimensions;

    vec2 dir = vec2(coord - vec2(0.5, 0.5));

    float _c = curvature > 0. ? curvature : 1.;
    float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;
    vec2 uv = dir * k;

    gl_FragColor = texture2D(uSampler, vTexCoord);
    vec3 rgb = gl_FragColor.rgb;


    if (noise > 0.0 && noiseSize > 0.0)
    {
        pixelCoord.x = floor(pixelCoord.x / noiseSize);
        pixelCoord.y = floor(pixelCoord.y / noiseSize);
        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;
        rgb += _noise * noise;
    }

    if (lineWidth > 0.0) {
        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;
        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;
        rgb *= j;
        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);
        rgb *= 0.99 + ceil(segment) * 0.015;
    }

    if (vignetting > 0.0)
    {
        float outter = SQRT_2 - vignetting * SQRT_2;
        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);
        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);
    }

    gl_FragColor.rgb = rgb;
}`;

export interface CRTFilterOptions extends FilterParameterObject {
  curvature?: number;
  lineWidth?: number;
  lineContrast?: number;
  verticalLine?: boolean;
  noise?: number;
  noiseSize?: number;
  seed?: number;
  vignetting?: number;
  vignettingAlpha?: number;
  vignettingBlur?: number;
  time?: number;
}

export class CRTFilter extends Filter {
  private dimensions: Float32Array;
  private filterArea: Float32Array;

  constructor(options: CRTFilterOptions) {
    super(options);
    this.dimensions = new Float32Array(2);
    this.filterArea = new Float32Array(4);
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
        curvature: {
          type: "float",
          value: "curvature" in options ? options.curvature : 1.0
        },
        lineWidth: {
          type: "float",
          value: "lineWidth" in options ? options.lineWidth : 1.0
        },
        lineContrast: {
          type: "float",
          value: "lineContrast" in options ? options.lineContrast : 0.25
        },
        verticalLine: {
          // bool
          type: "float",
          value: "verticalLine" in options ? (options.verticalLine ? 1 : 0) : 0
        },
        noise: {
          type: "float",
          value: "noise" in options ? options.noise : 0.0
        },
        noiseSize: {
          type: "float",
          value: "noiseSize" in options ? options.noiseSize : 1.0
        },
        seed: {
          type: "float",
          value: "seed" in options ? options.seed : 0
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
        time: {
          type: "float",
          value: "time" in options ? options.time : 0
        }
      }
    });
    this.move(options.x, options.y);
    this.resize(options.width, options.height);
  }

  set curvature(value) {
    this.shader.uniforms.curvature.value = value;
  }

  get curvature(): number {
    return this.shader.uniforms.curvature.value as any;
  }

  set lineWidth(value) {
    this.shader.uniforms.lineWidth.value = value;
  }

  get lineWidth(): number {
    return this.shader.uniforms.lineWidth.value as any;
  }

  set lineContrast(value) {
    this.shader.uniforms.lineContrast.value = value;
  }

  get lineContrast(): number {
    return this.shader.uniforms.lineContrast.value as any;
  }

  set verticalLine(value) {
    this.shader.uniforms.verticalLine.value = value ? 1 : 0;
  }

  get verticalLine(): boolean {
    return this.shader.uniforms.verticalLine.value as any;
  }

  set noise(value) {
    this.shader.uniforms.noise.value = value;
  }

  get noise(): number {
    return this.shader.uniforms.noise.value as any;
  }

  set noiseSize(value) {
    this.shader.uniforms.noiseSize.value = value;
  }

  get noiseSize(): number {
    return this.shader.uniforms.noiseSize.value as any;
  }

  set seed(value) {
    this.shader.uniforms.seed.value = value;
  }

  get seed(): number {
    return this.shader.uniforms.seed.value as any;
  }

  set vignetting(value) {
    this.shader.uniforms.vignetting.value = value;
  }

  get vignetting(): number {
    return this.shader.uniforms.vignetting.value as any;
  }

  set vignettingAlpha(value) {
    this.shader.uniforms.vignettingAlpha.value = value;
  }

  get vignettingAlpha(): number {
    return this.shader.uniforms.vignettingAlpha.value as any;
  }

  set vignettingBlur(value) {
    this.shader.uniforms.vignettingBlur.value = value;
  }

  get vignettingBlur(): number {
    return this.shader.uniforms.vignettingBlur.value as any;
  }

  get time(): number {
    return this.shader.uniforms.time.value as any;
  }

  set time(value: number) {
    this.shader.uniforms.time.value = value;
  }

  move(x: number, y: number) {
    super.move(x, y);
    this.filterArea[2] = x;
    this.filterArea[3] = y;
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this.dimensions[0] = this.filterArea[0] = width;
    this.dimensions[1] = this.filterArea[1] = height;
  }
}
