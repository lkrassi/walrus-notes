type Flake = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  windFactor: number;
  delay: number;
};

let canvas: OffscreenCanvas | null = null;
let driftCanvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let driftCtx: OffscreenCanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;
let DPR = 1;
let columnCount = 0;
let columnWidth = 0;
let accum: Float32Array = new Float32Array(0);
let flakes: Flake[] = [];
let targetFlakes = 0;
let last = 0;
let timerId: number | null = null;
let settings: Record<string, unknown> = {};
let fullPosted = false;

const rand = (a: number, b?: number) =>
  b == null ? Math.random() * a : a + Math.random() * (b - a);

function setSize(w: number, h: number, dpr: number) {
  width = w;
  height = h;
  DPR = dpr || 1;
  if (canvas) {
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
  }
  if (driftCanvas) {
    driftCanvas.width = Math.floor(width * DPR);
    driftCanvas.height = Math.floor(height * DPR);
  }
  columnCount = Math.max(64, Math.floor(width / 12));
  columnWidth = width / columnCount;
  const old = accum;
  accum = new Float32Array(columnCount);
  if (old && old.length) {
    for (let j = 0; j < columnCount; j++) {
      const t = (j + 0.5) / columnCount;
      const srcPos = t * old.length - 0.5;
      const i0 = Math.floor(srcPos);
      const frac = srcPos - i0;
      const v0 = i0 >= 0 && i0 < old.length ? old[i0] : 0;
      const v1 = i0 + 1 >= 0 && i0 + 1 < old.length ? old[i0 + 1] : 0;
      accum[j] = v0 * (1 - frac) + v1 * frac;
    }
  }
}

function makeSprite(r: number) {
  const s = new OffscreenCanvas(r * 4, r * 4);
  const sc = s.getContext('2d')!;
  sc.scale(1, 1);
  const cx = (r * 4) / 2;
  const cy = cx;
  const g = sc.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0.0)');
  sc.fillStyle = g;
  sc.beginPath();
  sc.arc(cx, cy, r * 2, 0, Math.PI * 2);
  sc.fill();
  return s.transferToImageBitmap();
}

const spriteCache = new Map<number, ImageBitmap>();

async function getSprite(r: number) {
  const key = Math.max(1, Math.round(r));
  const cached = spriteCache.get(key);
  if (cached) return cached;
  const bmp = makeSprite(key);
  spriteCache.set(key, bmp);
  return bmp;
}

async function spawnFlake(withDelay = true) {
  const r = Math.max(
    1,
    Math.round(Math.random() * ((settings.maxSize as number) || 4))
  );
  flakes.push({
    x: Math.random() * width,
    y: -r - Math.random() * height,
    vx: rand(-0.3, 0.3) + ((settings.wind as number) || 0.02) * rand(0.5, 1.5),
    vy: rand(0.5, 1.6) * (1 + r / 6),
    r,
    windFactor: Math.random() * 0.6 + 0.7,
    delay: withDelay ? Math.random() * 100 : 0,
  });
}

async function step(now: number) {
  if (!ctx || !driftCtx) return;
  const dt = Math.min(40, now - last) / 16.6667;
  last = now;

  const accumulationSpeed = (settings.accumulationSpeed as number) ?? 0.9;
  const wind = (settings.wind as number) ?? 0.02;

  ctx.clearRect(0, 0, width, height);

  if (flakes.length < targetFlakes) await spawnFlake(false);
  if (Math.random() < 0.25) await spawnFlake(false);

  for (let i = 0; i < flakes.length; i++) {
    const f = flakes[i];
    if (f.delay > 0) {
      f.delay -= dt;
      continue;
    }
    f.vx += wind * 0.04 * f.windFactor;
    f.x += f.vx * dt * 1.5;
    f.y += f.vy * dt;

    let col = (f.x / columnWidth) | 0;
    col = Math.max(0, Math.min(columnCount - 1, col));
    const groundY = height - accum[col];
    const isBelowAccum = f.y + f.r >= groundY;
    const isBelowBottom = f.y > height + 50;

    if (isBelowBottom || isBelowAccum) {
      if (isBelowAccum) {
        const spread = 2;
        const kernel = [0.05, 0.2, 0.5, 0.2, 0.05];
        const base = f.r * accumulationSpeed;
        for (let k = -spread; k <= spread; k++) {
          const idx = col + k;
          if (idx < 0 || idx >= columnCount) continue;
          const w = kernel[k + spread] ?? 0;
          accum[idx] += base * w;
        }
      }
      f.y = -f.r - Math.random() * 100;
      f.x = Math.random() * width;
      f.vx = rand(-0.3, 0.3) + wind * rand(0.5, 1.5);
      f.vy = rand(0.5, 1.6) * (1 + f.r / 6);
      f.delay = Math.random() * 20;
      continue;
    }

    if (f.x < -50) f.x = width + 50;
    if (f.x > width + 50) f.x = -50;

    const bmp = await getSprite(f.r);
    const sw = bmp.width / DPR;
    const sh = bmp.height / DPR;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(bmp, f.x - sw / 2, f.y - sh / 2, sw, sh);
    ctx.globalAlpha = 1;
  }

  const n = columnCount;
  for (let i = 0; i < n; i++) {
    const left = i > 0 ? accum[i - 1] : accum[i];
    const right = i < n - 1 ? accum[i + 1] : accum[i];
    const avg = (left + accum[i] + right) / 3;
    accum[i] += (avg - accum[i]) * 0.22;
  }
  for (let i = 0; i < n - 1; i++) {
    const d = accum[i] - accum[i + 1];
    if (d > 1e-2) {
      const transfer = d * 0.03;
      accum[i] -= transfer;
      accum[i + 1] += transfer;
    } else if (d < -1e-2) {
      const transfer = -d * 0.03;
      accum[i] += transfer;
      accum[i + 1] -= transfer;
    }
  }

  driftCtx.clearRect(0, 0, width, height);
  driftCtx.fillStyle = '#ffffff';
  driftCtx.beginPath();
  driftCtx.moveTo(0, height);
  for (let i = 0; i < columnCount; i++) {
    const x = i * columnWidth + columnWidth / 2;
    const y = height - accum[i];
    driftCtx.lineTo(x, y);
  }
  driftCtx.lineTo(width, height);
  driftCtx.closePath();
  driftCtx.fill();
  driftCtx.globalCompositeOperation = 'source-over';
  driftCtx.fillStyle = 'rgba(255,255,255,0.08)';
  driftCtx.fill();

  let maxAccum = 0;
  for (let i = 0; i < columnCount; i++)
    if (accum[i] > maxAccum) maxAccum = accum[i];
  if (!fullPosted && maxAccum > height * 0.9) {
    fullPosted = true;
    postMessage({ type: 'full' });
  }
}

function startLoop() {
  if (timerId != null) return;
  last = performance.now();
  timerId = setInterval(() => step(performance.now()), 16) as unknown as number;
}

function stopLoop() {
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
}

self.onmessage = async (ev: MessageEvent) => {
  const data = ev.data;
  if (!data || !data.type) return;
  switch (data.type) {
    case 'init': {
      canvas = data.canvas as OffscreenCanvas;
      driftCanvas = data.drift as OffscreenCanvas;
      setSize(data.width, data.height, data.DPR || 1);
      if (canvas) ctx = canvas.getContext('2d');
      if (driftCanvas) driftCtx = driftCanvas.getContext('2d');
      settings = data.settings || {};
      targetFlakes = Math.max(
        40,
        Math.floor(
          ((width / 1000) * ((settings.density as number) || 0.6) * 1000) / 3
        )
      );
      flakes = [];
      for (let i = 0; i < targetFlakes; i++) await spawnFlake(true);
      fullPosted = false;
      startLoop();
      break;
    }
    case 'resize': {
      setSize(data.width, data.height, data.DPR || 1);
      targetFlakes = Math.max(
        40,
        Math.floor(
          ((width / 1000) * ((settings.density as number) || 0.6) * 1000) / 3
        )
      );
      if (flakes.length > targetFlakes) {
        flakes.splice(0, flakes.length - targetFlakes);
      }
      break;
    }
    case 'update': {
      settings = { ...(settings || {}), ...(data.settings || {}) };
      targetFlakes = Math.max(
        40,
        Math.floor(
          ((width / 1000) * ((settings.density as number) || 0.6) * 1000) / 3
        )
      );
      if (flakes.length > targetFlakes) {
        flakes.splice(0, flakes.length - targetFlakes);
      }
      break;
    }
    case 'clear': {
      accum.fill(0);
      fullPosted = false;
      for (let i = 0; i < flakes.length; i++) {
        flakes[i].y = -flakes[i].r - Math.random() * 100;
        flakes[i].delay = Math.random() * 30;
      }
      try {
        if (ctx) ctx.clearRect(0, 0, width, height);
        if (driftCtx) driftCtx.clearRect(0, 0, width, height);
      } catch {}
      postMessage({ type: 'cleared' });
      break;
    }
    case 'stop': {
      stopLoop();
      break;
    }
    case 'start': {
      startLoop();
      break;
    }
    case 'terminate': {
      stopLoop();
      spriteCache.forEach(b => b.close());
      spriteCache.clear();
      break;
    }
    case 'reset': {
      // reset flakes to fall from top again
      flakes.length = 0;
      accum.fill(0);
      fullPosted = false;
      targetFlakes = Math.max(
        40,
        Math.floor(
          ((width / 1000) * ((settings.density as number) || 0.6) * 1000) / 3
        )
      );
      for (let i = 0; i < targetFlakes; i++) await spawnFlake(true);
      break;
    }
  }
};
