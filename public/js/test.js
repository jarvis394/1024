$(document).ready(() => {
  let size = 4;

  const root = $(".grid");
  const scoreLabel = document.getElementById("score");
  const restartBtn = document.getElementById("restart");
  const sizeBox = document.getElementById("size");

  const colors = {
    0: "#eee4da",
    2: "#D6CDC4",
    4: "#F5E9CF",
    8: "#F2B179",
    16: "#F58360",
    32: "#F65E3B",
    64: "#F6501C",
    128: "#EDC850",
    256: "#506EE5",
    512: "#63BAF1",
    1024: "#20DDB1",
    2048: "#333333"
  };
  const winScore = 1024;

  let tiles = [];
  let width = 400 / size - 6;
  let score = 0;
  let failed = false;
  let fontSize;
  let c = 0;

  ///////////////

  // Restart
  $("button").click(ev => {
    failed = false;
    start();
  });

  //// DRAW ////

  $("#size").change(e => {
    size = parseInt(sizeBox.value);
    width = 400 / size - 6;

    root.html("");

    start();
  });

  /**
   * Draw tile
   * @function
   * @param {object} - Tile object
   */
  function draw(tile) {
    $(".grid-" + tile.row).append(
      `<div style="transform: translate(${tile.x}, ${tile.y}); background: ${
        colors[tile.value]
      }" class="tile tile-${tile.col}">${tile.value ? tile.value : ""}</div>`
    );
  }

  /**
   * Create tiles array
   * @function
   */
  function createBoard() {
    for (let row = 0; row < size; row++) {
      tiles[row] = new Array(size).fill(0, 0, size);
    }
  }

  /**
   * Redraw all tiles
   * @function
   */
  function drawAll() {
    let left = 0;
    root.html("");

    for (let row = 0; row < size; row++) {
      root.append(`<div class="grid-${row} grid-row"></div>`);

      for (let col = 0; col < size; col++) {
        draw({
          value: tiles[row][col],
          x: col * width + 5 * (col + 1),
          y: row * width + 5 * (row + 1),
          row: row,
          col: col
        });

        if (tiles[row][col] == winScore) return won();

        if (slide(tiles, "up", true)) left++;
        else if (slide(tiles, "down", true)) left++;
        else if (slide(tiles, "right", true)) left++;
        else if (slide(tiles, "left", true)) left++;
      }
    }

    if (!left) return fail();

    scoreLabel.innerHTML = score;
  }

  /**
   * Put new tile to the random place
   * @function
   */
  function randomTile() {
    while (true) {
      let row = random(size);
      let col = random(size);

      if (!tiles[row][col]) {
        let val = Math.random() > 0.9 ? 4 : 2;

        tiles[row][col] = val;
        drawAll();

        break;
      }
    }
  }

  //// MOVE ////

  /**
   * Gestures and keyboard handler
   * @function
   */
  function move() {
    let mc = new Hammer.Manager(document.getElementsByClassName("grid")[0]);
    let gesture = new Hammer.Swipe();

    mc.add([gesture]);

    mc.on("swipeleft swiperight swipeup swipedown", ev => {
      if (failed) return;
      switch (ev.type.slice(5)) {
        case "up":
          slide(tiles, "up");
          break;
        case "down":
          slide(tiles, "down");
          break;
        case "right":
          slide(tiles, "right");
          break;
        case "left":
          slide(tiles, "left");
          break;
      }

      drawAll();
    });

    $(document).keydown(e => {
      if (failed) return;

      if (e.keyCode === 37) slide(tiles, "left");
      if (e.keyCode === 39) slide(tiles, "right");
      if (e.keyCode === 38) slide(tiles, "up");
      if (e.keyCode === 40) slide(tiles, "down");

      drawAll();
    });

    // TODO: Rewrite drawing at page load to put previous
    //       data from localStorage to tiles and etc.

    // if (storageAvailable('localStorage')) {
    //   let settings = {
    //     "tiles": tiles,
    //     "size": size,
    //     "score": score
    //   }
    //
    //   localStorage.setItem(settings)
    // } else {
    //   if (!c)
    //     console.warn("Browser does not support 'localStorage', then no data would be saved."),
    //     c++;
    // }
  }

  /**
   * Get object from matrix
   * @function
   * @param {number} i - Row/Col
   * @param {number} j - Row/Col
   * @param {string} direction - Direction (see {@link slide})
   */
  function getTile(i, j, direction) {
    switch (direction) {
      case "left":
        return tiles[i][j];
      case "right":
        return tiles[i][size - 1 - j];
      case "up":
        return tiles[j][i];
      case "down":
        return tiles[size - 1 - j][i];
    }
  }

  /**
   * Set object to matrix
   * @function
   * @param {number} i - Row/Col
   * @param {number} j - Row/Col
   * @param {string} direction - Direction (see {@link slide})
   * @param {number} value - Value to set
   */
  function setTile(i, j, direction, value) {
    switch (direction) {
      case "left":
        tiles[i][j] = value;
        break;
      case "right":
        tiles[i][size - 1 - j] = value;
        break;
      case "up":
        tiles[j][i] = value;
        break;
      case "down":
        tiles[size - 1 - j][i] = value;
        break;
    }
  }

  /**
   * Slide and combine function for matrix
   * @function
   * @param {array} rows - Matrix
   * @param {string} direction - Direction to slide (left, up, right, down)
   */
  function slide(tiles, direction, check) {
    let moved = false;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Find non-empty tile
        let k = j + 1;
        while (k < size && !getTile(i, k, direction)) {
          k++;
        }
        if (k == size) continue;

        // k < size && tiles[i][k]
        if (getTile(i, j, direction) == getTile(i, k, direction)) {
          if (check) return true;

          setTile(i, j, direction, getTile(i, j, direction) * 2);
          setTile(i, k, direction, 0);

          score += getTile(i, j, direction);
          moved = true;
        } else if (getTile(i, j, direction) == 0) {
          if (check) return true;

          setTile(i, j, direction, getTile(i, k, direction));
          setTile(i, k, direction, 0);

          // Stay on the same tile!
          j--;
          moved = true;
        }
      }
    }

    if (moved) randomTile();
  }

  /**
   * Start
   * @function
   */
  function start() {
    score = 0;
    scoreLabel.innerHTML = score;

    createBoard();
    randomTile();
    randomTile();

    drawAll();
  }

  /**
   * On failing
   * @function
   */
  function fail() {
    failed = true;
    console.log("FAILED");
  }

  /**
   * On winning
   * @function
   */
  function won() {
    failed = true;
    console.log("Well done!");
  }

  //// UTILS ////

  /**
   * Get random number from 0 to "end"
   * @function
   * @param {number} end - End of random numbers
   */
  function random(end) {
    return Math.floor(Math.random() * end);
  }

  /**
   * Check that storage is avaliable in client browser
   * @function
   * @param {number} type - Type of storage, e.g. 'localStorage'
   */
  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = "__test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        (e.code === 22 ||
          e.code === 1014 ||
          e.name === "QuotaExceededError" ||
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        storage.length !== 0
      );
    }
  }

  ///////////////

  start();
  move();
});
