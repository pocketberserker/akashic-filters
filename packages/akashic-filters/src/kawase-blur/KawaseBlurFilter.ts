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

// https://github.com/pixijs/pixi-filters/blob/v2.6.1/filters/kawase-blur/src/KawaseBlurFilter.js

import {Filter, FilterParameterObject} from "../Filter";
import Point from "../Point";

const fragment = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;

uniform vec2 uOffset;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture2D(uSampler, vec2(vTexCoord.x - uOffset.x, vTexCoord.y + uOffset.y));

    // Sample top right pixel
    color += texture2D(uSampler, vec2(vTexCoord.x + uOffset.x, vTexCoord.y + uOffset.y));

    // Sample bottom right pixel
    color += texture2D(uSampler, vec2(vTexCoord.x + uOffset.x, vTexCoord.y - uOffset.y));

    // Sample bottom left pixel
    color += texture2D(uSampler, vec2(vTexCoord.x - uOffset.x, vTexCoord.y - uOffset.y));

    // Average
    color *= 0.25;

    gl_FragColor = color;
}`;

export interface KawaseBlurFilterOptions extends FilterParameterObject {
  blur?: number;
  quality?: number;
}

export class KawaseBlurFilter extends Filter {
  private _blur: number;
  private _quality: number;
  private _offset: Float32Array;
  private _pixelSize: Point;
  private _kernels: number[];

  constructor(options: KawaseBlurFilterOptions) {
    super(options);
    this._blur = "blur" in options ? options.blur : 4;
    this.quality = "quality" in options ? options.quality : 3;
    this._offset = new Float32Array([0, 0]);
    this._pixelSize = new Point();
    this.shader = new g.ShaderProgram({
      fragmentShader: fragment,
      uniforms: {
        uOffset: {
          type: "vec2",
          value: this._offset
        }
      }
    });
  }

  apply(renderer: g.Renderer): void {
    const uvX = this.pixelSize.x / this.width;
    const uvY = this.pixelSize.y / this.height;
    let offset: number;

    if (this._quality === 1 || this._blur === 0) {
      offset = this._kernels[0] + 0.5;
      this._offset[0] = offset * uvX;
      this._offset[1] = offset * uvY;
    } else {
      const last = this._quality - 1;

      for (let i = 0; i < last; i++) {
        offset = this._kernels[i] + 0.5;
        this._offset[0] = offset * uvX;
        this._offset[1] = offset * uvY;
        renderer.setShaderProgram(this.shader);
      }
      offset = this._kernels[last] + 0.5;
      this._offset[0] = offset * uvX;
      this._offset[1] = offset * uvY;
    }

    renderer.setShaderProgram(this.shader);
  }

  get kernels() {
    return this._kernels;
  }
  set kernels(value) {
    if (Array.isArray(value) && value.length > 0) {
      this._kernels = value;
      this._quality = value.length;
      this._blur = Math.max.apply(Math, value);
    } else {
      // if value is invalid , set default value
      this._kernels = [0];
      this._quality = 1;
    }
  }

  set pixelSize(value) {
    if (typeof value === "number") {
      this._pixelSize.x = value;
      this._pixelSize.y = value;
    } else if (Array.isArray(value)) {
      this._pixelSize.x = value[0];
      this._pixelSize.y = value[1];
    } else if (value instanceof Point) {
      this._pixelSize.x = value.x;
      this._pixelSize.y = value.y;
    } else {
      // if value is invalid , set default value
      this._pixelSize.x = 1;
      this._pixelSize.y = 1;
    }
  }
  get pixelSize() {
    return this._pixelSize;
  }

  get quality() {
    return this._quality;
  }

  set quality(value) {
    this._quality = Math.max(1, Math.round(value));
    this.generateKernels();
  }

  get blur() {
    return this._blur;
  }

  set blur(value) {
    this._blur = value;
    this.generateKernels();
  }

  set offset(value) {
    this._offset[0] = value.x;
    this._offset[1] = value.y;
  }

  get offset(): Point {
    const value = this.shader.uniforms.uOffset.value as Float32Array;
    return new Point(value[0], value[1]);
  }

  private generateKernels() {
    const blur = this._blur;
    const quality = this._quality;
    const kernels = [blur];

    if (blur > 0) {
      let k = blur;
      const step = blur / quality;

      for (let i = 1; i < quality; i++) {
        k -= step;
        kernels.push(k);
      }
    }

    this._kernels = kernels;
  }
}
