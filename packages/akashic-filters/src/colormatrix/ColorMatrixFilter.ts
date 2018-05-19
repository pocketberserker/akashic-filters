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

// https://github.com/pixijs/pixi.js/blob/v4.7.3/src/filters/colormatrix/ColorMatrixFilter.js

import {Filter} from "../Filter";
import {colorMatrix} from "./colorMatrix";

export class ColorMatrixFilter implements Filter {
  private m: number[];
  private uniforms: {[key: string]: g.ShaderUniform};

  constructor() {
    this.m = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    this.uniforms = {
      uAlpha: {
        type: "float",
        value: 1
      }
    };
  }

  apply(renderer: g.Renderer): void {
    const shader = new g.ShaderProgram({
      fragmentShader: colorMatrix(this.m.map(n => new Number(n).toFixed(16))),
      uniforms: this.uniforms
    });
    renderer.setShaderProgram(shader);
  }

  set alpha(value) {
    this.uniforms.uAlpha.value = value;
  }

  get alpha() {
    return this.uniforms.uAlpha.value;
  }

  brightness(b: number, multiply?: boolean) {
    const matrix = [b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  greyscale(scale: number, multiply?: boolean) {
    const matrix = [scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, scale, scale, scale, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  blackAndWhite(multiply?: boolean) {
    const matrix = [0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0.3, 0.6, 0.1, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  hue(rotation?: number, multiply?: boolean) {
    rotation = (rotation || 0) / 180 * Math.PI;

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const sqrt = Math.sqrt;

    /* a good approximation for hue rotation
     This matrix is far better than the versions with magic luminance constants
     formerly used here, but also used in the starling framework (flash) and known from this
     old part of the internet: quasimondo.com/archives/000565.php
     This new matrix is based on rgb cube rotation in space. Look here for a more descriptive
     implementation as a shader not a general matrix:
     https://github.com/evanw/glfx.js/blob/58841c23919bd59787effc0333a4897b43835412/src/filters/adjust/huesaturation.js
     This is the source for the code:
     see http://stackoverflow.com/questions/8507885/shift-hue-of-an-rgb-color/8510751#8510751
     */

    const w = 1 / 3;
    const sqrW = sqrt(w); // weight is

    const a00 = cosR + (1.0 - cosR) * w;
    const a01 = w * (1.0 - cosR) - sqrW * sinR;
    const a02 = w * (1.0 - cosR) + sqrW * sinR;

    const a10 = w * (1.0 - cosR) + sqrW * sinR;
    const a11 = cosR + w * (1.0 - cosR);
    const a12 = w * (1.0 - cosR) - sqrW * sinR;

    const a20 = w * (1.0 - cosR) - sqrW * sinR;
    const a21 = w * (1.0 - cosR) + sqrW * sinR;
    const a22 = cosR + w * (1.0 - cosR);

    const matrix = [a00, a01, a02, 0, 0, a10, a11, a12, 0, 0, a20, a21, a22, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  contrast(amount?: number, multiply?: boolean) {
    const v = (amount || 0) + 1;
    const o = -0.5 * (v - 1);

    const matrix = [v, 0, 0, 0, o, 0, v, 0, 0, o, 0, 0, v, 0, o, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  saturate(amount = 0, multiply?: boolean) {
    const x = amount * 2 / 3 + 1;
    const y = (x - 1) * -0.5;

    const matrix = [x, y, y, 0, 0, y, x, y, 0, 0, y, y, x, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  desaturate() {
    this.saturate(-1);
  }

  negative(multiply?: boolean) {
    const matrix = [-1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, -1, 1, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  sepia(multiply?: boolean) {
    const matrix = [
      0.393,
      0.7689999,
      0.18899999,
      0,
      0,
      0.349,
      0.6859999,
      0.16799999,
      0,
      0,
      0.272,
      0.5339999,
      0.13099999,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  technicolor(multiply?: boolean) {
    const matrix = [
      1.9125277891456083,
      -0.8545344976951645,
      -0.09155508482755585,
      0,
      11.793603434377337,
      -0.3087833385928097,
      1.7658908555458428,
      -0.10601743074722245,
      0,
      -70.35205161461398,
      -0.231103377548616,
      -0.7501899197440212,
      1.847597816108189,
      0,
      30.950940869491138,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  polaroid(multiply?: boolean) {
    const matrix = [
      1.438,
      -0.062,
      -0.062,
      0,
      0,
      -0.122,
      1.378,
      -0.122,
      0,
      0,
      -0.016,
      -0.016,
      1.483,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  toBGR(multiply?: boolean) {
    const matrix = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  kodachrome(multiply?: boolean) {
    const matrix = [
      1.1285582396593525,
      -0.3967382283601348,
      -0.03992559172921793,
      0,
      63.72958762196502,
      -0.16404339962244616,
      1.0835251566291304,
      -0.05498805115633132,
      0,
      24.732407896706203,
      -0.16786010706155763,
      -0.5603416277695248,
      1.6014850761964943,
      0,
      35.62982807460946,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  browni(multiply?: boolean) {
    const matrix = [
      0.5997023498159715,
      0.34553243048391263,
      -0.2708298674538042,
      0,
      47.43192855600873,
      -0.037703249837783157,
      0.8609577587992641,
      0.15059552388459913,
      0,
      -36.96841498319127,
      0.24113635128153335,
      -0.07441037908422492,
      0.44972182064877153,
      0,
      -7.562075277591283,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  vintage(multiply?: boolean) {
    const matrix = [
      0.6279345635605994,
      0.3202183420819367,
      -0.03965408211312453,
      0,
      9.651285835294123,
      0.02578397704808868,
      0.6441188644374771,
      0.03259127616149294,
      0,
      7.462829176470591,
      0.0466055556782719,
      -0.0851232987247891,
      0.5241648018700465,
      0,
      5.159190588235296,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  colorTone(desaturation?: number, toned?: number, lightColor?: number, darkColor?: number, multiply?: boolean) {
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 0xffe580;
    darkColor = darkColor || 0x338000;

    const lR = ((lightColor >> 16) & 0xff) / 255;
    const lG = ((lightColor >> 8) & 0xff) / 255;
    const lB = (lightColor & 0xff) / 255;

    const dR = ((darkColor >> 16) & 0xff) / 255;
    const dG = ((darkColor >> 8) & 0xff) / 255;
    const dB = (darkColor & 0xff) / 255;

    const matrix = [
      0.3,
      0.59,
      0.11,
      0,
      0,
      lR,
      lG,
      lB,
      desaturation,
      0,
      dR,
      dG,
      dB,
      toned,
      0,
      lR - dR,
      lG - dG,
      lB - dB,
      0,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  night(intensity?: number, multiply?: boolean) {
    intensity = intensity || 0.1;
    const matrix = [
      intensity * -2.0,
      -intensity,
      0,
      0,
      0,
      -intensity,
      0,
      intensity,
      0,
      0,
      0,
      intensity,
      intensity * 2.0,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  predator(amount: number, multiply?: boolean) {
    const matrix = [
      // row 1
      11.224130630493164 * amount,
      -4.794486999511719 * amount,
      -2.8746118545532227 * amount,
      0 * amount,
      0.40342438220977783 * amount,
      // row 2
      -3.6330697536468506 * amount,
      9.193157196044922 * amount,
      -2.951810836791992 * amount,
      0 * amount,
      -1.316135048866272 * amount,
      // row 3
      -3.2184197902679443 * amount,
      -4.2375030517578125 * amount,
      7.476448059082031 * amount,
      0 * amount,
      0.8044459223747253 * amount,
      // row 4
      0,
      0,
      0,
      1,
      0
    ];

    this.loadMatrix(matrix, multiply);
  }

  lsd(multiply?: boolean) {
    const matrix = [2, -0.4, 0.5, 0, 0, -0.5, 2, -0.4, 0, 0, -0.4, -0.5, 3, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, multiply);
  }

  reset() {
    const matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

    this.loadMatrix(matrix, false);
  }

  set matrix(value: number[]) {
    this.m = value;
  }

  private loadMatrix(matrix: number[], multiply = false) {
    let newMatrix = matrix;

    if (multiply) {
      this.multiply(newMatrix, this.m, matrix);
      newMatrix = this.colorMatrix(newMatrix);
    }

    this.m = newMatrix;
  }

  private multiply(out: number[], a: number[], b: number[]) {
    // Red Channel
    out[0] = a[0] * b[0] + a[1] * b[5] + a[2] * b[10] + a[3] * b[15];
    out[1] = a[0] * b[1] + a[1] * b[6] + a[2] * b[11] + a[3] * b[16];
    out[2] = a[0] * b[2] + a[1] * b[7] + a[2] * b[12] + a[3] * b[17];
    out[3] = a[0] * b[3] + a[1] * b[8] + a[2] * b[13] + a[3] * b[18];
    out[4] = a[0] * b[4] + a[1] * b[9] + a[2] * b[14] + a[3] * b[19] + a[4];

    // Green Channel
    out[5] = a[5] * b[0] + a[6] * b[5] + a[7] * b[10] + a[8] * b[15];
    out[6] = a[5] * b[1] + a[6] * b[6] + a[7] * b[11] + a[8] * b[16];
    out[7] = a[5] * b[2] + a[6] * b[7] + a[7] * b[12] + a[8] * b[17];
    out[8] = a[5] * b[3] + a[6] * b[8] + a[7] * b[13] + a[8] * b[18];
    out[9] = a[5] * b[4] + a[6] * b[9] + a[7] * b[14] + a[8] * b[19] + a[9];

    // Blue Channel
    out[10] = a[10] * b[0] + a[11] * b[5] + a[12] * b[10] + a[13] * b[15];
    out[11] = a[10] * b[1] + a[11] * b[6] + a[12] * b[11] + a[13] * b[16];
    out[12] = a[10] * b[2] + a[11] * b[7] + a[12] * b[12] + a[13] * b[17];
    out[13] = a[10] * b[3] + a[11] * b[8] + a[12] * b[13] + a[13] * b[18];
    out[14] = a[10] * b[4] + a[11] * b[9] + a[12] * b[14] + a[13] * b[19] + a[14];

    // Alpha Channel
    out[15] = a[15] * b[0] + a[16] * b[5] + a[17] * b[10] + a[18] * b[15];
    out[16] = a[15] * b[1] + a[16] * b[6] + a[17] * b[11] + a[18] * b[16];
    out[17] = a[15] * b[2] + a[16] * b[7] + a[17] * b[12] + a[18] * b[17];
    out[18] = a[15] * b[3] + a[16] * b[8] + a[17] * b[13] + a[18] * b[18];
    out[19] = a[15] * b[4] + a[16] * b[9] + a[17] * b[14] + a[18] * b[19] + a[19];

    return out;
  }

  private colorMatrix(matrix: number[]) {
    // Create a Float32 Array and normalize the offset component to 0-1
    const m = matrix.slice();

    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    return m;
  }
}
