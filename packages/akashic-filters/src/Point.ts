export default class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  toVec2() {
    return new Float32Array([this.x, this.y]);
  }
}
