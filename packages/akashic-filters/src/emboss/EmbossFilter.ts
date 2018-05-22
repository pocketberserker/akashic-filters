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

// https://github.com/pixijs/pixi.js/blob/v4.7.3/src/filters/emboss/EmbossFilter.js

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform float strength;
uniform vec4 filterArea;

void main(void)
{
	vec2 onePixel = vec2(1.0 / filterArea);

	vec4 color;

	color.rgb = vec3(0.5);

	color -= texture2D(uSampler, vTexCoord - onePixel) * strength;
	color += texture2D(uSampler, vTexCoord + onePixel) * strength;

	color.rgb = vec3((color.r + color.g + color.b) / 3.0);

	float alpha = texture2D(uSampler, vTexCoord).a;

	gl_FragColor = vec4(color.rgb * alpha, alpha);
}`;

export interface EmbossFilterOptions extends FilterParameterObject {
  strength?: number;
}

export class EmbossFilter extends Filter {
  private filterArea: Float32Array;

  constructor(options: EmbossFilterOptions) {
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
        strength: {
          type: "float",
          value: "strength" in options ? options.strength : 5
        }
      }
    });
  }

  get strength() {
    return this.shader.uniforms.strength.value;
  }

  set strength(value) {
    this.shader.uniforms.strength.value = value;
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
}
