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

import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
uniform vec4 filterClamp;

uniform vec2 center;

uniform float amplitude;
uniform float wavelength;
// uniform float power;
uniform float brightness;
uniform float speed;
uniform float radius;

uniform float time;

const float PI = 3.14159;

void main()
{
    float halfWavelength = wavelength * 0.5 / filterArea.x;
    float maxRadius = radius / filterArea.x;
    float currentRadius = time * speed / filterArea.x;

    float fade = 1.0;

    if (maxRadius > 0.0) {
        if (currentRadius > maxRadius) {
            gl_FragColor = texture2D(uSampler, vTexCoord);
            return;
        }
        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);
    }

    vec2 dir = vec2(vTexCoord - center / filterArea.xy);
    dir.y *= filterArea.y / filterArea.x;
    float dist = length(dir);

    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {
        gl_FragColor = texture2D(uSampler, vTexCoord);
        return;
    }

    vec2 diffUV = normalize(dir);

    float diff = (dist - currentRadius) / halfWavelength;

    float p = 1.0 - pow(abs(diff), 2.0);

    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );
    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );

    vec2 offset = diffUV * powDiff / filterArea.xy;

    // Do clamp :
    vec2 coord = vTexCoord + offset;
    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(uSampler, clampedCoord);
    if (coord != clampedCoord) {
        color *= max(0.0, 1.0 - length(coord - clampedCoord));
    }

    // No clamp :
    // gl_FragColor = texture2D(uSampler, vTexCoord + offset);

    color.rgb *= 1.0 + (brightness - 1.0) * p * fade;

    gl_FragColor = color;
}`;

export interface ShockwaveFilterOptions extends FilterParameterObject {
  center?: number[];
  amplitude?: number;
  wavelength?: number;
  brightness?: number;
  speed?: number;
  radius?: number;
  time?: number;
}

export class ShockwaveFilter extends Filter {
  private filterArea: Float32Array;
  private filterClamp: Float32Array;

  constructor(options: ShockwaveFilterOptions) {
    super(options);
    this.filterArea = new Float32Array(4);
    this.filterClamp = new Float32Array(4);
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        filterArea: {
          type: "vec4",
          value: this.filterArea
        },
        filterClamp: {
          type: "vec4",
          value: this.filterClamp
        },
        center: {
          type: "vec2",
          value: "center" in options ? new Float32Array(options.center) : new Float32Array([0.0, 0.0])
        },
        amplitude: {
          type: "float",
          value: "amplitude" in options ? options.amplitude : 30.0
        },
        wavelength: {
          type: "float",
          value: "wavelength" in options ? options.wavelength : 160.0
        },
        brightness: {
          type: "float",
          value: "brightness" in options ? options.brightness : 1.0
        },
        speed: {
          type: "float",
          value: "speed" in options ? options.speed : 500.0
        },
        radius: {
          type: "float",
          value: "radius" in options ? options.radius : -1.0
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

  set center(value) {
    this.shader.uniforms.amplitude.value = new Float32Array(value);
  }

  get center() {
    return Array.from(this.shader.uniforms.amplitude.value as Float32Array);
  }

  set amplitude(value) {
    this.shader.uniforms.amplitude.value = value;
  }

  get amplitude(): number {
    return this.shader.uniforms.amplitude.value as any;
  }

  set wavelength(value) {
    this.shader.uniforms.wavelength.value = value;
  }

  get wavelength(): number {
    return this.shader.uniforms.wavelength.value as any;
  }

  set brightness(value) {
    this.shader.uniforms.brightness.value = value;
  }

  get brightness(): number {
    return this.shader.uniforms.brightness.value as any;
  }

  set speed(value) {
    this.shader.uniforms.speed.value = value;
  }

  get speed(): number {
    return this.shader.uniforms.speed.value as any;
  }

  set radius(value) {
    this.shader.uniforms.radius.value = value;
  }

  get radius(): number {
    return this.shader.uniforms.radius.value as any;
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
    this.filterArea[0] = width;
    this.filterArea[1] = height;
  }
}
