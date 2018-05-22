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

// https://github.com/pixijs/pixi-filters/blob/v2.6.1/filters/pixelate/src/PixelateFilter.js

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;

varying vec2 vTexCoord;

uniform vec2 size;
uniform sampler2D uSampler;

uniform vec4 filterArea;

vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}

vec2 pixelate(vec2 coord, vec2 size)
{
	return floor( coord / size ) * size;
}

void main(void)
{
    vec2 coord = mapCoord(vTexCoord);

    coord = pixelate(coord, size);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord);
}`;

export interface PixelateFilterOptions extends FilterParameterObject {
  size?: number;
}

export class PixelateFilter extends Filter {
  private filterArea: Float32Array;

  constructor(options: PixelateFilterOptions) {
    super(options);
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
        size: {
          type: "vec2",
          value: this.convert("size" in options ? options.size : 10)
        }
      }
    });
  }

  get size() {
    return this.shader.uniforms.size.value;
  }
  set size(value) {
    if (typeof value === "number") {
      value = this.convert(value);
    }
    this.shader.uniforms.size.value = value;
  }

  move(x: number, y: number) {
    super.move(x, y);
    this.filterArea[2] = x;
    this.filterArea[3] = y;
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this.filterArea[0] = width;
    this.filterArea[1] = height;
  }

  private convert(value: number) {
    return new Float32Array([value, value]);
  }
}
