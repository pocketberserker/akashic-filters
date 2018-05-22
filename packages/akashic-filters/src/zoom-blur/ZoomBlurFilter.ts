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

// https://github.com/pixijs/pixi-filters/blob/v2.6.1/filters/zoom-blur/src/ZoomBlurFilter.js

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uInnerRadius;
uniform float uRadius;

const float MAX_KERNEL_SIZE = 32.0;

float random(vec3 scale, float seed) {
    // use the fragment position for a different seed per-pixel
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {

    float minGradient = uInnerRadius * 0.3;
    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;

    float gradient = uRadius * 0.3;
    float radius = (uRadius - gradient * 0.5) / filterArea.x;

    float countLimit = MAX_KERNEL_SIZE;

    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTexCoord);
    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));

    float strength = uStrength;

    float delta = 0.0;
    float gap;
    if (dist < innerRadius) {
        delta = innerRadius - dist;
        gap = minGradient;
    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity
        delta = dist - radius;
        gap = gradient;
    }

    if (delta > 0.0) {
        float normalCount = gap / filterArea.x;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        strength *= delta;
        if (countLimit < 1.0)
        {
            gl_FragColor = texture2D(uSampler, vTexCoord);
            return;
        }
    }

    // randomize the lookup values to hide the fixed number of samples
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    float total = 0.0;
    vec4 color = vec4(0.0);

    dir *= strength;

    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {
        float percent = (t + offset) / MAX_KERNEL_SIZE;
        float weight = 4.0 * (percent - percent * percent);
        vec2 p = vTexCoord + dir * percent;
        vec4 sample = texture2D(uSampler, p);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;

        if (t > countLimit){
            break;
        }
    }

    color /= total;
    // switch back from pre-multiplied alpha
    color.rgb /= color.a + 0.00001;

    gl_FragColor = color;
}`;

export interface ZoomBlurFilterOptions extends FilterParameterObject {
  strength?: number;
  center?: number[];
  innerRadius?: number;
  radius?: number;
}

export class ZoomBlurFilter extends Filter {
  private filterArea: Float32Array;

  constructor(options: ZoomBlurFilterOptions) {
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
        uStrength: {
          type: "float",
          value: "strength" in options ? options.strength : 0.1
        },
        uCenter: {
          type: "vec2",
          value: "center" in options ? new Float32Array(options.center) : new Float32Array([0, 0])
        },
        uInnerRadius: {
          type: "float",
          value: "innerRadius" in options ? options.innerRadius : 0
        },
        uRadius: {
          type: "float",
          value: "radius" in options ? options.radius : -1
        }
      }
    });
  }

  get strength() {
    return this.shader.uniforms.uStrength.value;
  }

  set strength(value) {
    this.shader.uniforms.uStrength.value = value;
  }

  get center() {
    return this.shader.uniforms.uCenter.value;
  }

  set center(value) {
    this.shader.uniforms.uCenter.value = value;
  }

  get innerRadius() {
    return this.shader.uniforms.uInnerRadius.value;
  }

  set innerRadius(value) {
    this.shader.uniforms.uInnerRadius.value = value;
  }

  get radius() {
    return this.shader.uniforms.uRadius.value;
  }

  set radius(value) {
    if (typeof value === "number" && (value < 0 || value === Infinity)) {
      value = -1;
    }

    this.shader.uniforms.uRadius.value = value;
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
