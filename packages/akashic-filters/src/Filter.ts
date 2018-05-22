export interface FilterParameterObject extends g.PaneParameterObject {
  x: number;
  y: number;
}

export class Filter extends g.Pane {
  shader: g.ShaderProgram;

  constructor(param: FilterParameterObject) {
    super(param);
  }

  apply(renderer: g.Renderer) {
    renderer.setShaderProgram(this.shader);
  }

  renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
    renderer.save();
    this.apply(renderer);
    const shouldRenderChildren = super.renderSelf(renderer, camera);
    renderer.restore();
    return shouldRenderChildren;
  }

  destroy() {
    this.shader = null;
    super.destroy();
  }

  move(x: number, y: number) {
    this.x = x;
    this.x = y;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
