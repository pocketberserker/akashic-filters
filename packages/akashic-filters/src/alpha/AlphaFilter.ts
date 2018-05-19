import {Filter} from "../Filter";

const fragmentShader = `#version 100
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uSampler;
uniform float uAlpha;

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTexCoord) * uAlpha;
}`;

export class AlphaFilter implements Filter {
  private shader: g.ShaderProgram;

  constructor(alpha = 1.0) {
    this.shader = new g.ShaderProgram({
      fragmentShader,
      uniforms: {
        uAlpha: {
          type: "float",
          value: alpha
        }
      }
    });
  }

  apply(renderer: g.Renderer): void {
    renderer.setShaderProgram(this.shader);
  }

  set alpha(value) {
    this.shader.uniforms.uAlpha.value = value;
  }

  get alpha() {
    return this.shader.uniforms.uAlpha.value;
  }
}
