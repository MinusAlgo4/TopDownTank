// Better Tile Tank Game (advanced gameplay) BUT works with your current UI IDs
// Uses: canvas#c, overlay#overlay, startBtn, exitBtn, restartBtn, newMapBtn
// UI stats: #enemies #shots #fps

document.addEventListener("DOMContentLoaded", function () {

  // ===== Canvas setup =====
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  const overlay = document.getElementById("overlay");
  const startBtn = document.getElementById("startBtn");
  const exitBtn = document.getElementById("exitBtn");

  const restartBtn = document.getElementById("restartBtn");
  const newMapBtn = document.getElementById("newMapBtn");

  const uiWave = document.getElementById("wave");
  const uiEnemies = document.getElementById("enemies");
  const uiShots = document.getElementById("shots");
  const uiFps = document.getElementById("fps");

  ctx.imageSmoothingEnabled = false;

  // ===== Game constants =====
  const TILE = 32;
  const COLS = Math.floor(canvas.width / TILE);
  const ROWS = Math.floor(canvas.height / TILE);

  // tiles
  const T = { EMPTY: 0, BRICK: 1, STEEL: 2, WATER: 3, BUSH: 4, BORDER: 5 };

  const PLAYER_SPEED = 120;
  const ENEMY_SPEED = 70;
  const BULLET_SPEED = 280;
  const FIRE_COOLDOWN = 0.35;
  const ENEMY_FIRE_COOLDOWN = 0.9;

  const DIRS = {
    U: { x: 0, y: -1, a: -Math.PI / 2 },
    D: { x: 0, y: 1, a: Math.PI / 2 },
    L: { x: -1, y: 0, a: Math.PI },
    R: { x: 1, y: 0, a: 0 },
  };

  // ===== Utility =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const aabb = (x, y, w, h) => ({ x, y, w, h });

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ===== Map =====
  let map = [];

  function makeEmptyMap() {
    map = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(T.EMPTY));
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) map[y][x] = T.BORDER;
      }
    }
  }

  function stampRect(x0, y0, w, h, tile) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1) map[y][x] = tile;
      }
    }
  }

  // IMPORTANT: make map less confusing (fewer blocks than your original advanced)
  function generateMap() {
    makeEmptyMap();

    // fewer bricks (cleaner)
    for (let i = 0; i < 5; i++) {
      const w = randi(3, 5);
      const h = randi(2, 3);
      const x = randi(2, COLS - 2 - w);
      const y = randi(3, ROWS - 6 - h);
      stampRect(x, y, w, h, T.BRICK);
    }

    // few steels (small)
    for (let i = 0; i < 4; i++) {
      const w = randi(1, 2);
      const h = randi(1, 2);
      const x = randi(2, COLS - 3);
      const y = randi(2, ROWS - 3);
      stampRect(x, y, w, h, T.STEEL);
    }

    // little water
    for (let i = 0; i < 2; i++) {
      const vertical = Math.random() < 0.5;
      const len = randi(3, 5);
      const thick = 1;
      const x = randi(3, COLS - 4);
      const y = randi(3, ROWS - 4);
      stampRect(x, y, vertical ? thick : len, vertical ? len : thick, T.WATER);
    }

    // bushes for decoration
    for (let i = 0; i < 3; i++) {
      const w = randi(3, 5);
      const h = 1;
      const x = randi(2, COLS - 2 - w);
      const y = randi(2, ROWS - 2 - h);
      stampRect(x, y, w, h, T.BUSH);
    }
  }

  // ===== Collision =====
  function tileAt(px, py) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return T.BORDER;
    return map[ty][tx];
  }

  function isSolid(tile) {
    return tile === T.BORDER || tile === T.BRICK || tile === T.STEEL;
  }

  function isBlockedForTanks(tile) {
    return isSolid(tile) || tile === T.WATER;
  }

  function boxBlocked(box) {
    const pts = [
      [box.x, box.y],
      [box.x + box.w, box.y],
      [box.x, box.y + box.h],
      [box.x + box.w, box.y + box.h],
    ];
    for (const [x, y] of pts) {
      const t = tileAt(x, y);
      if (isBlockedForTanks(t)) return true;
    }
    return false;
  }

  // ===== Drawing helpers =====
  function fillRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawChecker(x, y, w, h, c1, c2, size = 4) {
    for (let yy = 0; yy < h; yy += size) {
      for (let xx = 0; xx < w; xx += size) {
        ctx.fillStyle = ((xx / size + yy / size) % 2 === 0) ? c1 : c2;
        ctx.fillRect(x + xx, y + yy, size, size);
      }
    }
  }

  function drawBrickTile(x, y) {
    fillRect(x, y, TILE, TILE, "#a1562f");
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let yy = 6; yy < TILE; yy += 10) ctx.fillRect(x, y + yy, TILE, 2);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(x + 1, y + 1, TILE - 2, 2);
  }

  function drawSteelTile(x, y) {
    drawChecker(x, y, TILE, TILE, "#d7dee6", "#aeb9c4", 4);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillRect(x, y, 2, TILE);
    ctx.fillRect(x, y + TILE - 2, TILE, 2);
    ctx.fillRect(x + TILE - 2, y, 2, TILE);
  }

  function drawWaterTile(x, y, t) {
    fillRect(x, y, TILE, TILE, "#1a5a7a");
    const phase = (t * 6) % TILE;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = 0; i < 3; i++) {
      const yy = y + ((i * 10 + phase) % TILE);
      ctx.fillRect(x, yy, TILE, 2);
    }
  }

  function drawBushTile(x, y) {
    drawChecker(x, y, TILE, TILE, "#3c6b3d", "#2e5630", 4);
  }

  function drawBorderTile(x, y) {
    fillRect(x, y, TILE, TILE, "#33404a");
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x, y, TILE, 3);
    ctx.fillRect(x, y, 3, TILE);
  }

  function drawFloor(x, y) {
    fillRect(x, y, TILE, TILE, "#141b22");
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(x + ((x / TILE) % 2 ? 2 : 0), y + ((y / TILE) % 2 ? 2 : 0), TILE - 6, TILE - 6);
  }

  // ===== Entities =====
  function makeTank(x, y, color, isEnemy = false) {
    return {
      x, y,
      w: 26, h: 26,
      dir: DIRS.U,
      color,
      isEnemy,
      fireCd: 0,
      brainCd: isEnemy ? rand(0.2, 0.8) : 0,
      alive: true,
    };
  }

  function tankBox(t) {
    return aabb(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h);
  }

  function makeBullet(owner, x, y, dir) {
    return { owner, x, y, dir, r: 3, alive: true };
  }


  let player;
  let enemies = [];
  let bullets = [];
  let currentWave = 1;
  const MAX_WAVES = 10;
  let waveCleared = false;
  let gameWon = false;

  function getEnemyCountForWave(wave) {
  return Math.min(2 + wave, 12);
}

function spawnWave() {
  enemies = [];
  bullets = [];

  const spawnPoints = [
    [TILE * 5, TILE * 3],
    [TILE * (COLS - 6), TILE * 3],
    [TILE * (COLS / 2), TILE * 3],
    [TILE * 3, TILE * 6],
    [TILE * (COLS - 4), TILE * 6]
  ];

  const enemyCount = getEnemyCountForWave(currentWave);

  for (let i = 0; i < enemyCount; i++) {
    const spot = spawnPoints[i % spawnPoints.length];
    const [sx, sy] = spot;

    const e = makeTank(
      sx + rand(-20, 20),
      sy + rand(-10, 10),
      "#ffd24a",
      true
    );

    e.dir = choice([DIRS.D, DIRS.L, DIRS.R]);

    // harder each wave
    e.speed = ENEMY_SPEED + (currentWave - 1) * 6;
    e.fireRate = Math.max(0.35, ENEMY_FIRE_COOLDOWN - (currentWave - 1) * 0.04);

    for (let k = 0; k < 20; k++) {
      if (!boxBlocked(tankBox(e))) break;
      e.x += rand(-TILE, TILE);
      e.y += rand(-TILE, TILE);
    }

    enemies.push(e);
  }

  waveCleared = false;
}

function resetGame(newMap = false, fullRestart = true) {
  if (newMap) generateMap();

  bullets = [];

  if (fullRestart) {
    currentWave = 1;
    gameWon = false;

    player = makeTank(TILE * 3, TILE * (ROWS - 3), "#66c2ff", false);
    player.dir = DIRS.U;
  } else {
    // keep player alive between waves, but move back to start
    player.x = TILE * 3;
    player.y = TILE * (ROWS - 3);
    player.dir = DIRS.U;
    player.alive = true;
    player.fireCd = 0;
  }

  spawnWave();
}

  // ===== Input (plus pause) =====
  const keys = new Set();
  let running = false;

  function showMenu() {
    running = false;
    overlay.classList.remove("hidden");
  }

  function startGame() {
    running = true;
    overlay.classList.add("hidden");
  }

  startBtn.addEventListener("click", startGame);
  exitBtn.addEventListener("click", showMenu);

  restartBtn.addEventListener("click", () => {
    resetGame(false, true);
    startGame();
  });

  newMapBtn.addEventListener("click", () => {
    resetGame(true, true);
    startGame();
  });

  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());

    if (e.key.toLowerCase() === "r") {
      resetGame(false,true);
      startGame();
    }

    if (e.key === "Escape") {
      if (running) showMenu();
      else startGame();
    }
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  // ===== Movement & shooting =====
  function moveTank(tank, dx, dy, dt) {
    const stepX = dx * dt;
    const stepY = dy * dt;

    tank.x += stepX;
    if (boxBlocked(tankBox(tank))) tank.x -= stepX;

    tank.y += stepY;
    if (boxBlocked(tankBox(tank))) tank.y -= stepY;

    tank.x = clamp(tank.x, TILE + tank.w / 2, canvas.width - TILE - tank.w / 2);
    tank.y = clamp(tank.y, TILE + tank.h / 2, canvas.height - TILE - tank.h / 2);
  }

  function tryShoot(tank) {
  if (tank.fireCd > 0) return;

  if (tank.isEnemy) {
    tank.fireCd = tank.fireRate || ENEMY_FIRE_COOLDOWN;
  } else {
    tank.fireCd = FIRE_COOLDOWN;
  }

  const muzzle = 16;
  const bx = tank.x + tank.dir.x * muzzle;
  const by = tank.y + tank.dir.y * muzzle;
  bullets.push(makeBullet(tank, bx, by, tank.dir));
}

  function bulletStep(b, dt) {
    b.x += b.dir.x * BULLET_SPEED * dt;
    b.y += b.dir.y * BULLET_SPEED * dt;

    if (b.x < 0 || b.y < 0 || b.x > canvas.width || b.y > canvas.height) {
      b.alive = false;
      return;
    }

    const t = tileAt(b.x, b.y);

    // brick breaks (cool feature)
    if (t === T.BRICK) {
      const tx = Math.floor(b.x / TILE);
      const ty = Math.floor(b.y / TILE);
      map[ty][tx] = T.EMPTY;
      b.alive = false;
      return;
    }

    if (t === T.STEEL || t === T.BORDER || t === T.WATER) {
      b.alive = false;
      return;
    }

    const targets = b.owner.isEnemy ? [player] : enemies;
    for (const tnk of targets) {
      if (!tnk.alive) continue;
      const hit = rectsOverlap(aabb(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2), tankBox(tnk));
      if (hit) {
        tnk.alive = false;
        b.alive = false;
        return;
      }
    }
  }

  // ===== Enemy AI =====
  function enemyBrain(e, dt) {
  e.brainCd -= dt;
  if (e.brainCd <= 0) {
    e.brainCd = rand(0.35, 1.2);
    if (Math.random() < 0.55) e.dir = choice([DIRS.U, DIRS.D, DIRS.L, DIRS.R]);
    if (Math.random() < 0.60) tryShoot(e);
  }

  const enemySpeed = e.speed || ENEMY_SPEED;
  const vx = e.dir.x * enemySpeed;
  const vy = e.dir.y * enemySpeed;

  const before = { x: e.x, y: e.y };
  moveTank(e, vx, vy, dt);

  // if stuck -> pick new direction
  if (Math.abs(e.x - before.x) < 0.01 && Math.abs(e.y - before.y) < 0.01) {
    e.dir = choice([DIRS.U, DIRS.D, DIRS.L, DIRS.R]);
  }
}

  // ===== Rendering =====
  function drawMap(timeSec) {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const px = x * TILE;
        const py = y * TILE;
        drawFloor(px, py);

        const tile = map[y][x];
        if (tile === T.BRICK) drawBrickTile(px, py);
        else if (tile === T.STEEL) drawSteelTile(px, py);
        else if (tile === T.WATER) drawWaterTile(px, py, timeSec);
        else if (tile === T.BUSH) drawBushTile(px, py);
        else if (tile === T.BORDER) drawBorderTile(px, py);
      }
    }
  }

  function drawTank(t) {
    if (!t.alive) return;

    const x = t.x, y = t.y;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - 14, y + 11, 28, 6);

    ctx.fillStyle = t.color;
    ctx.fillRect(x - 13, y - 13, 26, 26);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.dir.a);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(6, -2, 14, 4);
    ctx.restore();

    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 13, y - 13, 26, 26);
  }

  function drawBullets() {
    for (const b of bullets) {
      if (!b.alive) continue;
      ctx.fillStyle = b.owner.isEnemy ? "#ff5a5a" : "#ffd24a";
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    }
  }

  function drawHUD() {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(10, canvas.height - 36, 430, 26);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "12px Arial";
  ctx.fillText(
    "Wave: " + currentWave + "/" + MAX_WAVES + " | Move: WASD/Arrows | Shoot: Space | Restart: R | Esc: Menu",
    18,
    canvas.height - 18
  );
}

  // ===== Loop =====
  let last = performance.now();
  let fpsN = 0, fpsT = 0, fpsS = 0;

  function step(now) {
    const dt = Math.min(0.03, (now - last) / 1000);
    last = now;

    // FPS
    fpsT += dt; fpsN++;
    if (fpsT >= 0.5) {
      fpsS = Math.round(fpsN / fpsT);
      fpsN = 0; fpsT = 0;
      uiFps.textContent = String(fpsS);
    }

    // only update when running
    if (running) {
      if (player.alive) player.fireCd = Math.max(0, player.fireCd - dt);
      for (const e of enemies) e.fireCd = Math.max(0, e.fireCd - dt);

      if (player.alive) {
        let dx = 0, dy = 0;

        if (keys.has("arrowup") || keys.has("w")) { dy -= 1; player.dir = DIRS.U; }
        else if (keys.has("arrowdown") || keys.has("s")) { dy += 1; player.dir = DIRS.D; }

        if (keys.has("arrowleft") || keys.has("a")) { dx -= 1; player.dir = DIRS.L; }
        else if (keys.has("arrowright") || keys.has("d")) { dx += 1; player.dir = DIRS.R; }

        const len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;

        moveTank(player, dx * PLAYER_SPEED, dy * PLAYER_SPEED, dt);

        if (keys.has(" ")) tryShoot(player);
      }

      for (const e of enemies) if (e.alive) enemyBrain(e, dt);

      for (const b of bullets) if (b.alive) bulletStep(b, dt);
      bullets = bullets.filter(b => b.alive);

      // next wave
      if (!waveCleared && enemies.length > 0 && enemies.every(e => !e.alive)) {
        waveCleared = true;

        if (currentWave < MAX_WAVES) {
          currentWave++;

          setTimeout(function () {
            if (!gameWon) {
              spawnWave();
            }
          }, 1200);

        } else {
          gameWon = true;
          running = false;
          overlay.classList.remove("hidden");

          document.querySelector(".overlay-title").textContent = "YOU WIN!";
          document.querySelector(".overlay-sub").textContent = "You cleared all 10 waves.";
          startBtn.textContent = "PLAY AGAIN";
        }
          }
        }

    // draw always
    ctx.fillStyle = "#0f1418";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tsec = now / 1000;
    drawMap(tsec);

    drawTank(player);
    for (const e of enemies) drawTank(e);
    drawBullets();
    drawHUD();

    if (uiWave) uiWave.textContent = String(currentWave);
    uiEnemies.textContent = String(enemies.filter(e => e.alive).length);
    uiShots.textContent = String(bullets.length);

    requestAnimationFrame(step);
  }

  // ===== Start =====
  generateMap();
  resetGame(false, true);
  showMenu(); // start paused with overlay visible
  requestAnimationFrame(step);
});
