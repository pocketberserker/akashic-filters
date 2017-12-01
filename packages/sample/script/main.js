"use strict";
var filters = require("@pocketberserker/akashic-filters");

module.exports = function() {

  const scene = new g.Scene({game: g.game});
  scene.loaded.add(() => {

    const black = new g.FilledRect({
      scene: scene,
      cssColor: "#000000",
      width: g.game.width,
      height: g.game.height
    });
    scene.append(black);

    const builtin = new filters.FilterContainer({
      scene
    });
    builtin.filters = [
      new filters.BuiltInFilterBuilder()
        .blur("5px")
        .build()
    ];
    const red = new g.FilledRect({
      scene: scene,
      cssColor: "#ff0000",
      x: 10,
      y: 10,
      width: 32,
      height: 32
    });
    builtin.append(red);
    scene.append(builtin);

    const blue = new g.FilledRect({
      scene: scene,
      cssColor: "#0000ff",
      x: 50,
      y: 10,
      width: 32,
      height: 32
    });
    scene.append(blue);

    const snow = new filters.FilterContainer({
      scene
    });
    const snowflake = new filters.SnowflakeFilter({
      radius: {
        min: 0.5,
        max: 3.0
      },
      wind: {
        min: -0.5,
        max: 1.0
      },
      speed: {
        min: 1.0,
        max: 3.0
      },
      width: g.game.width,
      height: g.game.height,
      count: 200
    });
    snow.filters = [
      snowflake
    ];
    scene.append(snow);

    scene.update.add(function () {
      snowflake.update();
      snow.modified();
    });
  });

  g.game.pushScene(scene);
}
