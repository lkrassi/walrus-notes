import { useEffect, useState } from 'react';
import { Input } from 'shared';
import { cn } from 'shared/lib/cn';

interface ColorSelectorProps {
  value?: string;
  onChange: (hex?: string) => void;
  className?: string;
}

const normalizeHex = (c?: string) => {
  if (!c) return undefined;
  const s = c.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s.toLowerCase();
  if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return `#${s.toLowerCase()}`;
  return undefined;
};

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [local, setLocal] = useState<string | undefined>(
    normalizeHex(value) || '#3b82f6'
  );

  useEffect(() => {
    const n = normalizeHex(value);
    if (n) setLocal(n);
  }, [value]);

  const apply = (hex?: string) => {
    const n = normalizeHex(hex);
    setLocal(n || undefined);
    onChange(n);
  };

  const handleTextChange = (v: string) => {
    const candidate = v.trim();
    if (!candidate) {
      setLocal(undefined);
      onChange(undefined);
      return;
    }
    const normalized = normalizeHex(candidate);
    if (normalized) {
      setLocal(normalized);
      onChange(normalized);
    } else {
      setLocal(candidate);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex', 'items-center', 'gap-2')}>
        <input
          aria-label='color-swatch'
          type='color'
          value={local || '#000000'}
          onChange={e => apply(e.target.value)}
          className={cn('h-8', 'w-8', 'p-0', 'border-0', 'bg-transparent')}
        />
        <Input
          aria-label='color-hex'
          type='text'
          placeholder='#rrggbb'
          value={local || ''}
          onChange={e => handleTextChange(e.target.value)}
          className={cn('form-input', 'rounded-md')}
          style={{ width: 120 }}
        />
      </div>
    </div>
  );
};
