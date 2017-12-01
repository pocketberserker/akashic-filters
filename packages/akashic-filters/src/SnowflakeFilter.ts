"use strict";
import {Filter} from "./Filter";

function random(min: number, max: number) {
  return g.game.random.get(min, max);
}

export interface SnowflakeParameterObject {
  width: number;
  height: number;
  radius: {
    min: number,
    max: number
  };
  wind: {
    min: number,
    max: number
  };
  speed: {
    min: number,
    max: number
  };
  color?: string;
}

class Snowflake {

  private x: number;
  private y: number;
  private radius: number;
  private wind: number;
  private speed: number;
  private color: string;
  private height: number;
  private width: number;

  constructor(param: SnowflakeParameterObject) {
    this.x = random(0, param.width);
    this.y = random(-param.height, 0);
    this.radius = random(param.radius.min, Math.min(3.0, param.radius.max));
    this.wind = random(param.wind.min, Math.min(3.0, param.wind.max));
    this.speed = random(Math.max(1.0, param.speed.min), Math.min(3.0, param.speed.max));
    this.color = param.color ? param.color : "#ffffff";
    this.width = param.width;
    this.height = param.height;
  }

  draw(renderer: g.Renderer) {
    if(this.outOfRange) {
      return;
    }
    renderer.begin();
    for (let y = this.y - this.radius; y <= this.y + this.radius; ++y) {
      const w = this.radius * Math.cos(Math.asin((this.y - y) / this.radius));
      renderer.fillRect(this.x - w, y, 2 * w, 1, this.color);
    }
    renderer.end();
  }

  update() {
    this.x += this.wind;
    this.y += this.speed;

    if(this.outOfRange) {
      this.x = random(0, this.width);
      this.y = 0;
    }
  }

  private get outOfRange() {
    return this.x < -(this.radius * 2) || this.x > this.width || this.y > this.height;
  }
}

export interface SnowflakeFilterParameterObject extends SnowflakeParameterObject {
  count: number;
}

export class SnowflakeFilter implements Filter {

  private snowflakes: Snowflake[];

  constructor(param: SnowflakeFilterParameterObject) {
    this.snowflakes = new Array(param.count);
    for(let i = 0; i < param.count; i++) {
      this.snowflakes[i] = new Snowflake(param);
    }
  }

  apply(renderer: g.Renderer): void {
    for(const snowflake of this.snowflakes) {
      snowflake.draw(renderer);
    }
  }

  update() {
    for(const snowflake of this.snowflakes) {
      snowflake.update();
    }
  }
}
