"use strict";
var filters = require("@pocketberserker/akashic-filters");

module.exports = function() {

  const scene = new g.Scene({game: g.game});
  scene.loaded.add(() => {

    const container = new filters.FilterContainer({
      scene
    });
    container.filters = [
      new filters.BuiltInFilterBuilder()
        .blur("5px")
        .build()
    ];
    scene.append(container);

    const red = new g.FilledRect({
      scene: scene,
      cssColor: "#ff0000",
      x: 10,
      y: 10,
      width: 32,
      height: 32
    });
    container.append(red);

    const blue = new g.FilledRect({
      scene: scene,
      cssColor: "#0000ff",
      x: 50,
      y: 10,
      width: 32,
      height: 32
    });
    scene.append(blue);
  });

  g.game.pushScene(scene);
}
