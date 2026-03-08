import { cn } from '@/shared/lib/core';
import { memo, useCallback, type FC } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import 'react-colorful/dist/style.css';

interface CircularColorPickerProps {
  value?: string;
  onChange: (hex?: string) => void;
  size?: number;
  className?: string;
}

export const CircularColorPicker: FC<CircularColorPickerProps> = memo(
  function CircularColorPicker({ value, onChange, size = 220, className }) {
    const color = value || '#3b82f6';
    const px = `${size}px`;

    const handleChange = useCallback(
      (c: string) => {
        onChange(c);
      },
      [onChange]
    );

    return (
      <div className={cn('inline-block', className)} style={{ width: px }}>
        <div style={{ width: px }}>
          <HexColorPicker color={color} onChange={handleChange} />
        </div>
        <div className={cn('mt-2')}>
          <HexColorInput color={color} onChange={handleChange} prefixed />
        </div>
      </div>
    );
  }
);
