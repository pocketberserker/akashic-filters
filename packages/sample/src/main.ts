import * as filters from "@pocketberserker/akashic-filters";

module.exports = () => {
  const scene = new g.Scene({game: g.game});
  const width = g.game.width / 3;
  scene.loaded.add(() => {
    const left = new filters.FilterContainer({
      scene,
      x: 0,
      y: 0,
      width,
      height: g.game.height
    });
    const colorMatrix = new filters.ColorMatrixFilter({
      scene,
      x: left.x,
      y: left.y,
      width: left.width / 3,
      height: left.height
    });
    colorMatrix.sepia();
    left.filters = [colorMatrix];
    scene.append(left);

    const black = new g.FilledRect({
      scene: scene,
      cssColor: "black",
      width,
      height: g.game.height
    });
    left.append(black);

    const red = new g.FilledRect({
      scene,
      cssColor: "red",
      x: 10,
      y: 10,
      width: 32,
      height: 32
    });
    left.append(red);

    const blue = new g.FilledRect({
      scene,
      cssColor: "blue",
      x: 50,
      y: 10,
      width: 32,
      height: 32
    });
    left.append(blue);

    const center = new filters.FilterContainer({
      scene,
      x: g.game.width / 3,
      y: 0,
      width,
      height: g.game.height
    });
    const ray = new filters.GodrayFilter({
      scene,
      x: center.x,
      y: center.y,
      width: center.width,
      height: center.height
    });
    center.filters = [ray];
    scene.append(center);

    const green = new g.FilledRect({
      scene,
      cssColor: "green",
      width: center.width,
      height: center.height
    });
    center.append(green);

    const right = new filters.FilterContainer({
      scene,
      x: (g.game.width / 3) * 2,
      y: 0,
      width,
      height: g.game.height
    });
    const film = new filters.OldFilmFilter({
      scene,
      x: right.x,
      y: right.y,
      width: right.width,
      height: right.height,
      vignetting: 0.1
    });
    right.filters = [film];
    scene.append(right);

    const white = new g.FilledRect({
      scene,
      cssColor: "white",
      width: right.width,
      height: right.height
    });
    right.append(white);

    const yellow = new g.FilledRect({
      scene,
      cssColor: "yellow",
      x: right.width / 2 - 16,
      y: right.height / 2 - 16,
      width: 32,
      height: 32
    });
    right.append(yellow);

    scene.update.add(() => {
      ray.time = g.game.age;
      center.invalidate();
      film.seed = g.game.random.get(0, 100) / 100;
      right.invalidate();
    });
  });

  g.game.pushScene(scene);
};
