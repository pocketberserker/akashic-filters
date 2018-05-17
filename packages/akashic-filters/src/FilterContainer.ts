"use strict";
import {Filter} from "./Filter";

export class FilterContainer extends g.E {
  private _filters: Filter[];

  constructor(param: g.EParameterObject) {
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

    if (this.children) {
      const children = this.children; // NOTE: Not cloned. Will break if modified while rendering
      for (let i = 0; i < children.length; ++i) {
        children[i].render(renderer, camera);
      }
    }

    renderer.restore();

    return false;
  }

  destroy(): void {
    this._filters = null;

    super.destroy();
  }
}
