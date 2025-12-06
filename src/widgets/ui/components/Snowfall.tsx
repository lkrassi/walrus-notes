import React, { useEffect, useRef, useState } from 'react';
import { useHolidaySettings } from 'widgets/hooks/useHolidaySettings';
import { useIsMobile, useLocalization } from 'widgets/hooks';
import { drawSnowflake } from './drawSnowflake';

type SnowfallProps = {
  density?: number;
  wind?: number;
  maxSize?: number;
  accumulationSpeed?: number;
  autoReload?: boolean;
  autoReloadDelay?: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const Snowfall: React.FC<SnowfallProps> = ({
  density: densityProp = 0.6,
  wind = 0.02,
  maxSize = 4,
  accumulationSpeed = 0.9,
  autoReload = true,
  autoReloadDelay = 3000,
}) => {
  const { enabled, settings } = useHolidaySettings();
  const isMobile = useIsMobile();
  const densityFromSettings = settings?.density ?? densityProp;
  const density = isMobile
    ? Math.min(densityFromSettings, 0.35)
    : densityFromSettings;
  const snowEnabled = !!settings?.snow && enabled;
  const densityRef = useRef<number>(density);
  const snowEnabledRef = useRef<boolean>(snowEnabled);

  useEffect(() => {
    densityRef.current = density;
    snowEnabledRef.current = snowEnabled;
    if (workerRef.current) {
      try {
        workerRef.current.postMessage({
          type: 'update',
          settings: {
            density: densityRef.current,
            wind,
            maxSize,
            accumulationSpeed,
            autoReload,
            autoReloadDelay,
          },
        });
        if (!snowEnabledRef.current) {
          try {
            workerRef.current.postMessage({ type: 'clear' });
          } catch {}
          try {
            workerRef.current.postMessage({ type: 'stop' });
          } catch {}
        } else {
          try {
            workerRef.current.postMessage({ type: 'start' });
          } catch {}
        }
      } catch {}
    } else {
      try {
        const f = flakesRef.current;
        const d = driftRef.current;
        if (!snowEnabledRef.current) {
          if (f) {
            const c = f.getContext('2d');
            if (c) c.clearRect(0, 0, f.width, f.height);
            (f.style as CSSStyleDeclaration).display = 'none';
          }
          if (d) {
            const c2 = d.getContext('2d');
            if (c2) c2.clearRect(0, 0, d.width, d.height);
            (d.style as CSSStyleDeclaration).display = 'none';
          }
          setFullReached(false);
        } else {
          if (f) (f.style as CSSStyleDeclaration).display = '';
          if (d) (d.style as CSSStyleDeclaration).display = '';
        }
      } catch {}
    }
  }, [
    density,
    snowEnabled,
    wind,
    maxSize,
    accumulationSpeed,
    autoReload,
    autoReloadDelay,
  ]);

  const flakesRef = useRef<HTMLCanvasElement | null>(null);
  const driftRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const listenersAttachedRef = useRef(false);
  const onResizeRef = useRef<(() => void) | null>(null);
  const onClearRef = useRef<(() => void) | null>(null);
  const onMessageRef = useRef<((e: MessageEvent) => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const spriteCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const prevMaxSizeRef = useRef<number>(maxSize);

  const [fullReached, setFullReached] = useState(false);

  useEffect(() => {
    let flakesCanvas = flakesRef.current;
    let driftCanvas = driftRef.current;
    if (!flakesCanvas || !driftCanvas) return;

    const supportsOffscreen = 'OffscreenCanvas' in window;

    if (supportsOffscreen) {
      const DPR = window.devicePixelRatio || 1;

      if (workerRef.current) {
        try {
          workerRef.current.postMessage({
            type: 'update',
            settings: {
              density,
              wind,
              maxSize,
              accumulationSpeed,
              autoReload,
              autoReloadDelay,
            },
          });
          workerRef.current.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            DPR,
          });
          if (!enabled) workerRef.current.postMessage({ type: 'stop' });
        } catch {}
        return;
      }

      try {
        const off1 = (
          flakesCanvas as unknown as HTMLCanvasElement & {
            transferControlToOffscreen?: () => OffscreenCanvas;
          }
        ).transferControlToOffscreen!();
        const off2 = (
          driftCanvas as unknown as HTMLCanvasElement & {
            transferControlToOffscreen?: () => OffscreenCanvas;
          }
        ).transferControlToOffscreen!();
        const worker = new Worker(
          new URL('./snow.worker.ts', import.meta.url),
          {
            type: 'module',
          }
        );
        workerRef.current = worker;

        const sendInit = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          worker.postMessage(
            {
              type: 'init',
              canvas: off1,
              drift: off2,
              width: w,
              height: h,
              DPR,
              settings: {
                density,
                wind,
                maxSize,
                accumulationSpeed,
                autoReload,
                autoReloadDelay,
              },
            },
            [off1, off2]
          );
        };

        const onMessage = (e: MessageEvent) => {
          const d = e.data;
          if (!d) return;
          if (d.type === 'full') setFullReached(true);
          if (d.type === 'cleared') setFullReached(false);
        };

        worker.addEventListener('message', onMessage);
        onMessageRef.current = onMessage;

        sendInit();

        const onResize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          try {
            worker.postMessage({ type: 'resize', width: w, height: h, DPR });
          } catch {}
        };
        const onClear = () => {
          try {
            worker.postMessage({ type: 'clear' });
          } catch {}
        };
        onResizeRef.current = onResize;
        onClearRef.current = onClear;

        window.addEventListener('resize', onResize);
        window.addEventListener('wn.snow.clear', onClear as EventListener);
        listenersAttachedRef.current = true;

        try {
          worker.postMessage({
            type: 'update',
            settings: {
              density,
              wind,
              maxSize,
              accumulationSpeed,
              autoReload,
              autoReloadDelay,
            },
          });
        } catch {}

        if (!enabled) {
          try {
            worker.postMessage({ type: 'stop' });
          } catch {}
        }

        return;
      } catch {
        try {
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
        } catch {}

        try {
          if (flakesCanvas && flakesCanvas.parentElement) {
            const parent = flakesCanvas.parentElement;
            const newFlakes = document.createElement('canvas');
            newFlakes.className = flakesCanvas.className || '';
            newFlakes.style.cssText =
              (flakesCanvas as HTMLCanvasElement).style.cssText || '';
            parent.replaceChild(newFlakes, flakesCanvas);
            flakesRef.current = newFlakes;
            flakesCanvas = newFlakes;
          }
          if (driftCanvas && driftCanvas.parentElement) {
            const parent2 = driftCanvas.parentElement;
            const newDrift = document.createElement('canvas');
            newDrift.className = driftCanvas.className || '';
            newDrift.style.cssText =
              (driftCanvas as HTMLCanvasElement).style.cssText || '';
            parent2.replaceChild(newDrift, driftCanvas);
            driftRef.current = newDrift;
            driftCanvas = newDrift;
          }
        } catch {}
      }
    }

    const ctx = flakesCanvas.getContext('2d')!;
    const driftCtx = driftCanvas.getContext('2d')!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      flakesCanvas.style.width = width + 'px';
      flakesCanvas.style.height = height + 'px';
      flakesCanvas.width = Math.floor(width * DPR);
      flakesCanvas.height = Math.floor(height * DPR);

      driftCanvas.style.width = width + 'px';
      driftCanvas.style.height = height + 'px';
      driftCanvas.width = Math.floor(width * DPR);
      driftCanvas.height = Math.floor(height * DPR);

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      driftCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let columnCount = Math.max(64, Math.floor(width / 12));
    let columnWidth = width / columnCount;
    let accum = new Float32Array(columnCount);

    type Flake = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      windFactor: number;
      delay: number;
    };

    const flakes: Flake[] = [];
    const getTargetFlakes = () =>
      Math.max(40, Math.floor((width / 1000) * densityRef.current * 1000));

    const rand = (a: number, b?: number) =>
      b == null ? Math.random() * a : a + Math.random() * (b - a);

    const spriteCache = spriteCacheRef.current;
    if (prevMaxSizeRef.current !== maxSize) {
      spriteCache.clear();
      prevMaxSizeRef.current = maxSize;
    }

    const maxCacheKey = Math.max(10, Math.round(maxSize));

    const getFlakeSprite = (r: number) => {
      const key = clamp(Math.round(r), 1, maxCacheKey);
      const cached = spriteCache.get(key);
      if (cached) return cached;
      const s = document.createElement('canvas');
      const scale = DPR;
      const size = Math.ceil(key * 4 * scale);
      s.width = size;
      s.height = size;
      const sc = s.getContext('2d')!;
      sc.scale(scale, scale);
      drawSnowflake(
        sc,
        size / (2 * scale),
        size / (2 * scale),
        key,
        'rgba(255,255,255,1)'
      );
      spriteCache.set(key, s);
      return s;
    };

    const spawnFlake = (withDelay = true) => {
      const r = Math.max(1, Math.floor(Math.random() * maxSize) + 1);

      flakes.push({
        x: Math.random() * width,
        y: -r - Math.random() * 100,
        vx: rand(-0.3, 0.3) + wind * rand(0.5, 1.5),
        vy: rand(0.5, 1.6) * (1 + r / 6),
        r,
        windFactor: Math.random() * 0.6 + 0.7,
        delay: withDelay ? Math.random() * 100 : 0,
      });
    };

    const initialTarget = getTargetFlakes();
    for (let i = 0; i < initialTarget; i++) spawnFlake(true);

    let last = performance.now();
    let fullTriggered = false;
    let spawnTimer = 0;
    let frameCount = 0;

    const step = (now: number) => {
      const dt = Math.min(40, now - last) / 16.6667;
      last = now;
      if (!snowEnabledRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      spawnTimer += dt;
      const currentTargetFlakes = getTargetFlakes();
      if (flakes.length > currentTargetFlakes) {
        const remove = flakes.length - currentTargetFlakes;
        flakes.splice(0, remove);
      } else if (flakes.length < currentTargetFlakes) spawnFlake(false);
      if (spawnTimer > 2) {
        spawnTimer = 0;
        if (Math.random() < 0.3) spawnFlake(false);
      }

      for (let i = 0, n = flakes.length; i < n; i++) {
        const f = flakes[i];
        if (f.delay > 0) {
          f.delay -= dt;
          continue;
        }

        f.vx += wind * 0.04 * f.windFactor;
        f.x += f.vx * dt * 1.5;
        f.y += f.vy * dt;

        let col = (f.x / columnWidth) | 0;
        col = clamp(col, 0, columnCount - 1) as number;

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

        const sprite = getFlakeSprite(f.r);
        const sw = sprite.width / DPR;
        const sh = sprite.height / DPR;
        const alpha = 0.7 + Math.sin(f.y * 0.01) * 0.2;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, f.x - sw / 2, f.y - sh / 2, sw, sh);
      }

      ctx.globalAlpha = 1;

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

      frameCount++;
      let maxAccum = 0;
      if (frameCount % 20 === 0) {
        for (let i = 0; i < columnCount; i++)
          if (accum[i] > maxAccum) maxAccum = accum[i];
      }

      if (!fullTriggered && maxAccum > height * 0.9) {
        fullTriggered = true;
        setFullReached(true);
        if (autoReload) {
          timeoutRef.current = window.setTimeout(() => {
            try {
              location.reload();
            } catch {}
          }, autoReloadDelay) as unknown as number;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    const onClear = () => {
      accum.fill(0);
      fullTriggered = false;
      setFullReached(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      for (let i = 0; i < flakes.length; i++) {
        flakes[i].y = -flakes[i].r - Math.random() * 100;
        flakes[i].delay = Math.random() * 30;
      }
    };

    window.addEventListener('wn.snow.clear', onClear as EventListener);

    const resizeColumns = () => {
      const newCount = Math.max(64, Math.floor(window.innerWidth / 12));
      if (newCount === columnCount) return;
      const old = accum;
      const newAcc = new Float32Array(newCount);
      for (let j = 0; j < newCount; j++) {
        const t = (j + 0.5) / newCount;
        const srcPos = t * columnCount - 0.5;
        const i0 = Math.floor(srcPos);
        const frac = srcPos - i0;
        const v0 = i0 >= 0 && i0 < old.length ? old[i0] : 0;
        const v1 = i0 + 1 >= 0 && i0 + 1 < old.length ? old[i0 + 1] : 0;
        newAcc[j] = v0 * (1 - frac) + v1 * frac;
      }
      accum = newAcc;
      columnCount = newCount;
      columnWidth = window.innerWidth / columnCount;
    };

    window.addEventListener('resize', resizeColumns);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', resizeColumns);
      window.removeEventListener('wn.snow.clear', onClear as EventListener);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [wind, maxSize, accumulationSpeed, autoReload, autoReloadDelay]);

  useEffect(() => {
    return () => {
      if (onMessageRef.current && workerRef.current) {
        try {
          workerRef.current.removeEventListener(
            'message',
            onMessageRef.current
          );
        } catch {}
      }
      if (listenersAttachedRef.current) {
        if (onResizeRef.current)
          window.removeEventListener('resize', onResizeRef.current);
        if (onClearRef.current)
          window.removeEventListener(
            'wn.snow.clear',
            onClearRef.current as EventListener
          );
        listenersAttachedRef.current = false;
      }
      if (workerRef.current) {
        try {
          workerRef.current.postMessage({ type: 'terminate' });
        } catch {}
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = null;
      }
    };
  }, []);

  const { t } = useLocalization();

  return (
    <div className='pointer-events-none fixed inset-0 z-50'>
      <canvas
        ref={flakesRef}
        className='absolute inset-0 h-full w-full'
        style={{ mixBlendMode: 'screen' }}
      />
      <canvas
        ref={driftRef}
        className='absolute bottom-0 left-0 h-full w-full'
        style={{ filter: 'blur(1px) drop-shadow(0 1px 2px rgba(0,0,0,0.06))' }}
      />

      {fullReached && (
        <div className='pointer-events-auto fixed right-6 bottom-6'>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent('wn.snow.clear'))
            }
            className='bg-opacity-90 hover:bg-opacity-100 rounded bg-white px-4 py-2 text-gray-800 shadow-lg transition'
            aria-label={t('settings:holiday.clearSnow') || 'Очистить снег'}
          >
            {t('settings:holiday.clearSnow') || 'Очистить снег'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Snowfall;
