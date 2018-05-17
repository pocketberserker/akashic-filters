import * as filters from "@pocketberserker/akashic-filters";

module.exports = () => {
  const scene = new g.Scene({game: g.game});
  scene.loaded.add(() => {
    const container = new filters.FilterContainer({
      scene,
      width: g.game.width,
      height: g.game.height
    });
    const sepia = new filters.ColorMatrixFilter();
    sepia.sepia();
    container.filters = [sepia];
    scene.append(container);

    const black = new g.FilledRect({
      scene: scene,
      cssColor: "#000000",
      width: g.game.width,
      height: g.game.height
    });
    container.append(black);

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
    container.append(blue);

    scene.update.add(() => {});

    container.invalidate();
  });

  g.game.pushScene(scene);
};
