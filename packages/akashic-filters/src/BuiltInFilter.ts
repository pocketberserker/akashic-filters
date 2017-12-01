"use strict";
import {Filter} from "./Filter";

export class BuiltInFilterBuilder {

  private filters: string[];

  constructor(filters?: string[]) {
    this.filters = filters ? filters : [];
  }

  build(): BuiltInFilter {
    return new BuiltInFilter(this.filters);
  }

  blur(length: string) {
    return this.add(`blur(${length})`);
  }

  brightness(percentage: string) {
    return this.add(`brightness(${percentage})`);
  }

  contrast(percentage: string) {
    return this.add(`contrast(${percentage})`);
  }

  dropShadow(offsetX: number, offsetY: number, blurRadius: string, color: string) {
    return this.add(`drop-shadow(${offsetX} ${offsetY} ${blurRadius} ${color})`);
  }

  grayscale(percentage: string) {
    return this.add(`grayscale(${percentage})`);
  }

  hueRotate(degree: string) {
    return this.add(`hue-rotate(${degree})`);
  }

  invert(percentage: string) {
    return this.add(`invert(${percentage})`);
  }

  opacity(percentage: string) {
    return this.add(`opacity(${percentage})`);
  }

  saturate(percentage: string) {
    return this.add(`saturate(${percentage})`);
  }

  sepia(percentage: string) {
    return this.add(`sepia(${percentage})`);
  }

  private add(filter: string) {
    this.filters.push(filter);
    return this;
  }
}

export class BuiltInFilter implements Filter {

  private filter: string;

  constructor(filters: string[]) {
    this.filter = filters.join(" ");
  }

  apply(renderer: g.Renderer): void {
    // FIXME: CanvasRenderingContext2D.filter に依存している
    (renderer as any).context.filter = this.filter;
  }
}
