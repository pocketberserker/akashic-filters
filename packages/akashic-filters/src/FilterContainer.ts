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
      const filters = this._filters; // NOTE: Not cloned. Will break if modified while rendering
      for (const filter of filters) {
        filter.apply(renderer);
      }
    }

    const shouldRenderChildren = super.renderSelf(renderer, camera);

    renderer.restore();

    return shouldRenderChildren;
  }

  destroy(): void {
    if (this._renderer) {
      this._renderer.setShaderProgram(null);
    }
    if (this._filters) {
      for (const filter of this._filters) {
        filter.destroy();
      }
    }
    this._filters = null;
    super.destroy();
  }
}
