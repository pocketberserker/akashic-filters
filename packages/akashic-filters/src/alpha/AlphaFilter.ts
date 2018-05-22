import {Filter, FilterParameterObject} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform float uAlpha;

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTexCoord) * uAlpha;
}`;

export interface AlphaFilterOptions extends FilterParameterObject {
  alpha: number;
}

export class AlphaFilter extends Filter {
  constructor(options: AlphaFilterOptions) {
    super(options);
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        uAlpha: {
          type: "float",
          value: "alpha" in options ? options.alpha : 1.0
        }
      }
    });
  }

  set alpha(value) {
    this.shader.uniforms.uAlpha.value = value;
  }

  get alpha() {
    return this.shader.uniforms.uAlpha.value;
  }
}
