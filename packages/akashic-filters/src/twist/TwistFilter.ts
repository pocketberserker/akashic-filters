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

// https://github.com/pixijs/pixi-filters/tree/v3.0.3/filters/twist

import Point from "../Point";
import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform float angle;
uniform vec2 offset;
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

vec2 twist(vec2 coord)
{
    coord -= offset;

    float dist = length(coord);

    if (dist < radius)
    {
        float ratioDist = (radius - dist) / radius;
        float angleMod = ratioDist * ratioDist * angle;
        float s = sin(angleMod);
        float c = cos(angleMod);
        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
    }

    coord += offset;

    return coord;
}

void main(void)
{

    vec2 coord = mapCoord(vTexCoord);

    coord = twist(coord);

    coord = unmapCoord(coord);

    gl_FragColor = texture2D(uSampler, coord );

}`;

// TODO: imple padding
export interface TwistFilterOptions extends FilterParameterObject {
  radius?: number;
  twistAngle?: number;
}

export class TwistFilter extends Filter {
  private filterArea: Float32Array;

  constructor(options: TwistFilterOptions) {
    super(options);
    this.filterArea = new Float32Array(4);
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        filterArea: {
          type: "vec4",
          value: this.filterArea
        },
        radius: {
          type: "float",
          value: "radius" in options ? options.radius : 200
        },
        angle: {
          type: "float",
          value: "twistAngle" in options ? options.twistAngle : 4
        },
        offset: {
          type: "vec2",
          value: new Float32Array([0, 0])
        }
      }
    });
    this.move(options.x, options.y);
    this.resize(options.width, options.height);
  }

  set radius(value) {
    this.shader.uniforms.radius.value = value;
  }

  get radius(): number {
    return this.shader.uniforms.radius.value as any;
  }

  set twistAngle(value) {
    this.shader.uniforms.angle.value = value;
  }

  get twistAngle(): number {
    return this.shader.uniforms.angle.value as any;
  }

  set offset(value) {
    this.shader.uniforms.offset.value = value.toVec2();
  }

  get offset(): Point {
    const value = this.shader.uniforms.angle.value as Float32Array;
    return new Point(value[0], value[1]);
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
