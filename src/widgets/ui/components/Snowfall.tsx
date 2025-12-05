import React, { useEffect, useRef, useState } from 'react';
import { useHolidaySettings } from 'widgets/hooks/useHolidaySettings';

type SnowfallProps = {
  density?: number;
  wind?: number;
  maxSize?: number;
  accumulationSpeed?: number;
  autoReload?: boolean;
  autoReloadDelay?: number;
};

const Snowfall: React.FC<SnowfallProps> = ({
  density = 0.6,
  wind = 0.02,
  maxSize = 4,
  accumulationSpeed = 0.9,
  autoReload = true,
  autoReloadDelay = 3000,
}) => {
  const { enabled } = useHolidaySettings();
  const flakesRef = useRef<HTMLCanvasElement | null>(null);
  const driftRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const deviceRatioRef = useRef<number>(1);
  const [fullReached, setFullReached] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const flakesCanvas = flakesRef.current!;
    const driftCanvas = driftRef.current!;
    if (!flakesCanvas || !driftCanvas) return;

    if (!enabled) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const c = flakesCanvas.getContext('2d');
      const d = driftCanvas.getContext('2d');
      if (c) c.clearRect(0, 0, flakesCanvas.width, flakesCanvas.height);
      if (d) d.clearRect(0, 0, driftCanvas.width, driftCanvas.height);
      return;
    }

    const ctx = flakesCanvas.getContext('2d')!;
    const driftCtx = driftCanvas.getContext('2d')!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const DPR = window.devicePixelRatio || 1;
    deviceRatioRef.current = DPR;

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

    const columnCount = Math.max(64, Math.floor(width / 12));
    const columnWidth = width / columnCount;
    const accum: number[] = new Array(columnCount).fill(0);

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
    const targetFlakes = Math.floor((width / 1000) * density * 1000);

    const rand = (a: number, b?: number) =>
      b == null ? Math.random() * a : a + Math.random() * (b - a);

    const spawnFlake = (withDelay: boolean = true) => {
      const r = Math.max(1, Math.random() * maxSize);
      const startY = -r - Math.random() * 100;
      
      flakes.push({
        x: Math.random() * width,
        y: startY,
        vx: rand(-0.3, 0.3) + wind * rand(0.5, 1.5),
        vy: rand(0.5, 1.6) * (1 + r / 6),
        r,
        windFactor: Math.random() * 0.6 + 0.7,
        delay: withDelay ? Math.random() * 100 : 0
      });
    };

    for (let i = 0; i < targetFlakes; i++) {
      spawnFlake(true);
    }

    let last = performance.now();
    let fullTriggered = false;
    let spawnTimer = 0;

    const step = (now: number) => {
      const dt = Math.min(40, now - last) / 16.6667;
      last = now;

      ctx.clearRect(0, 0, width, height);

      spawnTimer += dt;
      if (flakes.length < targetFlakes) {
        spawnFlake(false);
      }

      if (spawnTimer > 2) {
        spawnTimer = 0;
        if (Math.random() < 0.3) {
          spawnFlake(false);
        }
      }

      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i];
        
        if (f.delay > 0) {
          f.delay -= dt;
          continue;
        }
        
        f.vx += wind * 0.04 * f.windFactor;
        f.x += f.vx * dt * 1.5;
        f.y += f.vy * dt;

        const isBelowBottom = f.y > height + 50;
        const isBelowAccum = () => {
          const col = Math.min(columnCount - 1, Math.floor(f.x / columnWidth));
          const groundY = height - accum[col];
          return f.y + f.r >= groundY;
        };

        if (isBelowBottom || isBelowAccum()) {
          if (isBelowAccum()) {
            const col = Math.min(columnCount - 1, Math.floor(f.x / columnWidth));
            accum[col] += f.r * accumulationSpeed;
            if (col > 0) accum[col - 1] += f.r * 0.12 * accumulationSpeed;
            if (col < columnCount - 1)
              accum[col + 1] += f.r * 0.12 * accumulationSpeed;
          }
          
          flakes[i].y = -f.r - Math.random() * 100;
          flakes[i].x = Math.random() * width;
          flakes[i].vx = rand(-0.3, 0.3) + wind * rand(0.5, 1.5);
          flakes[i].vy = rand(0.5, 1.6) * (1 + f.r / 6);
          flakes[i].delay = Math.random() * 20; 
          continue;
        }

        if (f.x < -50) f.x = width + 50;
        if (f.x > width + 50) f.x = -50;

        if (f.delay <= 0) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${0.7 + Math.sin(f.y * 0.01) * 0.2})`;
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let k = 0; k < 2; k++) {
        for (let i = 1; i < columnCount - 1; i++) {
          const a = accum[i - 1];
          const b = accum[i];
          const c = accum[i + 1];
          const avg = (a + b + c) / 3;
          accum[i] += (avg - b) * 0.15;
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

      const maxAccum = Math.max(...accum);
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
      for (let i = 0; i < accum.length; i++) accum[i] = 0;
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

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wn.snow.clear', onClear as EventListener);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    density,
    wind,
    maxSize,
    accumulationSpeed,
    autoReload,
    autoReloadDelay,
    enabled,
  ]);

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
        style={{
          filter: 'blur(0px) drop-shadow(0 2px 4px rgba(0,0,0,0.04))',
        }}
      />
      {fullReached && (
        <div className='pointer-events-auto fixed right-6 bottom-6'>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent('wn.snow.clear'))
            }
            className='bg-opacity-90 hover:bg-opacity-100 rounded bg-white px-4 py-2 text-gray-800 shadow-lg transition'
            aria-label='Очистить снег'
          >
            Очистить снег
          </button>
        </div>
      )}
    </div>
  );
};

export default Snowfall;