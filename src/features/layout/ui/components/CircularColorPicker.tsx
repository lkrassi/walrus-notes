import React, { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'shared/lib/cn';

interface CircularColorPickerProps {
  value?: string;
  onChange: (hex?: string) => void;
  size?: number; // CSS px
  className?: string;
}

const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

const rgbToHex = (r: number, g: number, b: number) => {
  return (
    '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
  ).toLowerCase();
};

function hexToRgb(hex?: string) {
  if (!hex) return null;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  return null;
}

const rgbToHsv = (r: number, g: number, b: number) => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d === 0) h = 0;
  else if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
};

const CircularColorPicker: React.FC<CircularColorPickerProps> = ({
  value,
  onChange,
  size = 220,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [marker, setMarker] = useState({ x: 0, y: 0, visible: false });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssSize = size;
    const width = Math.round(cssSize * dpr);
    const height = width;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 1;

    const img = ctx.createImageData(width, height);
    const data = img.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * width + x) * 4;
        if (r <= radius) {
          const angle = Math.atan2(dy, dx);
          let deg = (angle * 180) / Math.PI;
          if (deg < 0) deg += 360;
          const sat = Math.min(1, r / radius);
          const [rr, gg, bb] = hsvToRgb(deg, sat, 1);
          data[idx] = rr;
          data[idx + 1] = gg;
          data[idx + 2] = bb;
          data[idx + 3] = 255;
        } else {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    // overlay: value (v) control via radial gradient (black center to transparent at top?)
    // keep v=1 for full brightness by default; user can adjust with separate control if needed
  }, [size]);

  useEffect(() => {
    draw();
  }, [draw]);

  // update marker position when value prop changes
  useEffect(() => {
    if (!value) {
      setMarker(m => ({ ...m, visible: false }));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rgb = hexToRgb(value);
    if (!rgb) return;
    const { h, s } = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    const radius = Math.min(cx, cy) - 1;
    const r = s * radius;
    const angle = (h * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    setMarker({ x, y, visible: true });
  }, [value]);

  const getColorFromEvent = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e as PointerEvent).clientX - cx;
      const y = (e as PointerEvent).clientY - cy;
      const dist = Math.sqrt(x * x + y * y);
      const radius = rect.width / 2 - 1;
      if (dist > radius) return; // ignore outside
      const sat = Math.min(1, dist / radius);
      const angle = Math.atan2(y, x);
      let deg = (angle * 180) / Math.PI;
      if (deg < 0) deg += 360;
      const [rr, gg, bb] = hsvToRgb(deg, sat, 1);
      const hex = rgbToHex(rr, gg, bb);
      onChange(hex);
    },
    [onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    getColorFromEvent(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    getColorFromEvent(e);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div ref={wrapperRef} className={cn('inline-block', className)}>
      <canvas
        ref={canvasRef}
        role='img'
        aria-label='color-wheel'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none', display: 'block', borderRadius: '50%' }}
      />
      {marker.visible && (
        <div
          style={{
            position: 'relative',
            marginTop: `-${size}px`,
            width: `${size}px`,
            height: `${size}px`,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: marker.x - 8,
              top: marker.y - 8,
              width: 16,
              height: 16,
              borderRadius: 9999,
              border: '2px solid white',
              boxShadow: '0 0 0 2px rgba(0,0,0,0.12) inset',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CircularColorPicker;
