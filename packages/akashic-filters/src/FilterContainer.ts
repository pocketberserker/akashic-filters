import {Filter} from "./Filter";

export class FilterContainer extends g.Pane {
  private _filters: Filter[];

  constructor(param: g.PaneParameterObject) {
    super(param);
    this.filters = [];
  }

  get filters(): Filter[] {
    return this._filters;
  }

  set filters(values: Filter[]) {
    this._filters = values;
  }

  renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
    renderer.save();

    if (this._filters) {
      for (const filter of this._filters) {
        filter.apply(renderer);
      }
    }

    const shouldRenderChildren = super.renderSelf(renderer, camera);

    renderer.restore();

    return shouldRenderChildren;
  }

  destroy(): void {
    this._filters = null;

    if (this._renderer) {
      this._renderer.setShaderProgram(null);
    }

    super.destroy();
  }
}
