import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import useHolidaySettings from 'widgets/hooks/useHolidaySettings';
import { useIsMobile } from 'widgets/hooks';

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  swayPhase: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
  depth: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const gradientCache = new Map<number, CanvasGradient>();

const getSnowflakeGradient = (
  ctx: CanvasRenderingContext2D,
  size: number
): CanvasGradient => {
  const cached = gradientCache.get(size);
  if (cached) return cached;

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  gradientCache.set(size, gradient);
  return gradient;
};

const debounce = (fn: any, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

const getAdaptiveCount = (baseCount: number): number => {
  if (typeof window === 'undefined') return baseCount;

  const area = window.innerWidth * window.innerHeight;
  const referenceArea = 1920 * 1080;
  const maxCount = 600;

  return Math.min(
    maxCount,
    Math.floor(baseCount * Math.sqrt(area / referenceArea))
  );
};

export const HolidaySnow: React.FC<{ count?: number }> = ({ count = 220 }) => {
  const { enabled } = useHolidaySettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const heightsRef = useRef<Float32Array | null>(null);
  const colsRef = useRef<number>(0);
  const lastRef = useRef<number | null>(null);
  const windRef = useRef<number>(0);

  const adaptiveCount = useMemo(() => getAdaptiveCount(count), [count]);
  const isMobile = useIsMobile();
  const effectiveCount = useMemo(
    () =>
      isMobile ? Math.max(40, Math.round(adaptiveCount * 0.1)) : adaptiveCount,
    [adaptiveCount, isMobile]
  );
  const [covered, setCovered] = useState(false);
  const startRef = useRef<(() => void) | null>(null);

  const initParticles = useCallback(
    (canvas: HTMLCanvasElement) => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      particlesRef.current = new Array(effectiveCount);
      for (let i = 0; i < effectiveCount; i++) {
        const depth = Math.random();
        const r = clamp(1 + depth * 3 + Math.random() * 3, 0.8, 6);
        particlesRef.current[i] = {
          x: Math.random() * w,
          y: Math.random() * -h,
          r,
          vy: 20 + depth * 80 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 10,
          swayPhase: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          alpha: 0.6 + depth * 0.4,
          depth,
        };
      }
    },
    [effectiveCount]
  );

  const resize = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const colWidth = 4;
      colsRef.current = Math.ceil(w / colWidth) + 2;

      if (
        !heightsRef.current ||
        heightsRef.current.length !== colsRef.current
      ) {
        heightsRef.current = new Float32Array(colsRef.current);
      }
      heightsRef.current.fill(0);
    },
    []
  );

  const addSnowAt = useCallback((x: number, amount: number, w: number) => {
    const heights = heightsRef.current;
    if (!heights) return;

    const colWidth = w / (heights.length - 2);
    const center = Math.floor(x / colWidth) + 1;
    const radius = Math.max(1, Math.floor(6 + Math.random() * 6));

    const influences = new Array(radius * 2 + 1);
    for (let i = -radius; i <= radius; i++) {
      influences[i + radius] = Math.exp(-Math.abs(i) / (radius / 2 + 0.001));
    }

    for (let i = -radius; i <= radius; i++) {
      const idx = center + i;
      if (idx < 0 || idx >= heights.length) continue;
      heights[idx] += amount * influences[i + radius];
    }
  }, []);

  const drawPile = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const heights = heightsRef.current;
      if (!heights) return;

      const colW = w / (heights.length - 2);
      const temp = new Float32Array(heights.length);

      for (let i = 0; i < heights.length; i++) {
        const prev = heights[Math.max(0, i - 1)];
        const curr = heights[i];
        const next = heights[Math.min(heights.length - 1, i + 1)];
        temp[i] = (prev + curr * 2 + next) * 0.25;
      }

      for (let i = 0; i < heights.length; i++) {
        heights[i] = temp[i];
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let i = 0; i < heights.length; i++) {
        ctx.lineTo((i - 1) * colW, h - heights[i]);
      }

      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, h - 120, 0, h);
      grad.addColorStop(0, 'rgba(255,255,255,0.98)');
      grad.addColorStop(1, 'rgba(245,248,250,1)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.globalAlpha = 0.6;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.translate(0, -2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < heights.length; i++) {
        const x = (i - 1) * colW;
        const y = h - heights[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  const step = useCallback(
    (now: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(t => step(t, canvas, ctx));
        return;
      }

      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min(40, now - (lastRef.current || now));
      lastRef.current = now;

      if (dt < 16) {
        rafRef.current = requestAnimationFrame(t => step(t, canvas, ctx));
        return;
      }

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      windRef.current += (Math.sin(now / 2000) * 0.02 - windRef.current) * 0.02;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const heights = heightsRef.current;
      const colCount = heights ? heights.length : 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const sway =
          Math.sin((now / 1000) * (0.5 + p.depth) + p.swayPhase) *
          (1.2 + p.depth * 2);
        p.vx += windRef.current * (0.2 + p.depth * 0.8) * (dt / 16);
        p.x += (p.vx + sway) * (dt / 16);
        p.y += p.vy * (dt / 1000);
        p.rot += p.rotSpeed * (dt / 16);

        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;

        const colIndex = heights
          ? Math.floor((p.x / w) * (colCount - 2)) + 1
          : 1;
        const groundY = heights
          ? h - (heights[clamp(colIndex, 0, colCount - 1)] || 0)
          : h;

        if (p.y + p.r >= groundY) {
          addSnowAt(p.x, p.r * 0.8 + Math.random() * p.r, w);
          p.x = Math.random() * w;
          p.y = -10 - Math.random() * 200;
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = 20 + p.depth * 80 + Math.random() * 40;
          p.swayPhase = Math.random() * Math.PI * 2;
        }

        ctx.save();
        ctx.globalAlpha = clamp(p.alpha, 0.15, 1);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        const gradient = getSnowflakeGradient(ctx, p.r);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawPile(ctx, w, h);

      if (heights) {
        let maxH = 0;
        for (let i = 0; i < heights.length; i++)
          maxH = Math.max(maxH, heights[i]);
        const coverThreshold = h * 0.9;
        if (maxH >= coverThreshold) {
          setCovered(true);
          rafRef.current = null;
          return;
        }
      }

      rafRef.current = requestAnimationFrame(t => step(t, canvas, ctx));
    },
    [addSnowAt, drawPile]
  );

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mounted = true;

    const handleResize = debounce(() => {
      if (!mounted) return;
      resize(canvas, ctx);
      initParticles(canvas);
    }, 100);

    const startAnimation = () => {
      resize(canvas, ctx);
      initParticles(canvas);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      lastRef.current = null;
      setCovered(false);
      rafRef.current = requestAnimationFrame(now => {
        lastRef.current = now;
        step(now, canvas, ctx);
      });
      startRef.current = startAnimation;
    };

    startAnimation();

    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      if (document.hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!document.hidden && !rafRef.current && mounted) {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      gradientCache.clear();
    };
  }, [enabled, resize, initParticles, step]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: covered ? 'auto' : 'none',
        zIndex: 2147483646,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          willChange: 'transform',
          transform: 'translateZ(0)',
          pointerEvents: 'none',
        }}
      />

      {covered && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 24,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 2147483647,
          }}
        >
          <button
            onClick={() => {
              const heights = heightsRef.current;
              if (heights) heights.fill(0);
              setCovered(false);
              const canvas = canvasRef.current;
              if (canvas && startRef.current) startRef.current();
            }}
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '10px 16px',
              borderRadius: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              cursor: 'pointer',
            }}
          >
            Очистить снег
          </button>
        </div>
      )}
    </div>
  );
};

export default HolidaySnow;
