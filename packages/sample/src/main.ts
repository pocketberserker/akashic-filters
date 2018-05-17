"use strict";
import * as filters from "@pocketberserker/akashic-filters";

module.exports = () => {
  const scene = new g.Scene({game: g.game});
  scene.loaded.add(() => {
    const black = new g.FilledRect({
      scene: scene,
      cssColor: "#000000",
      width: g.game.width,
      height: g.game.height
    });
    scene.append(black);

    const container = new filters.FilterContainer({
      scene
    });
    container.filters = [];
    const red = new g.FilledRect({
      scene: scene,
      cssColor: "#ff0000",
      x: 10,
      y: 10,
      width: 32,
      height: 32
    });
    container.append(red);
    scene.append(container);

    const blue = new g.FilledRect({
      scene: scene,
      cssColor: "#0000ff",
      x: 50,
      y: 10,
      width: 32,
      height: 32
    });
    scene.append(blue);

    scene.update.add(() => {});
  });

  g.game.pushScene(scene);
};
