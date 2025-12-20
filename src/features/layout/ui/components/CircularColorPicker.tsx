import React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import 'react-colorful/dist/style.css';
import cn from 'shared/lib/cn';

interface CircularColorPickerProps {
  value?: string;
  onChange: (hex?: string) => void;
  size?: number;
  className?: string;
}

const CircularColorPicker: React.FC<CircularColorPickerProps> = ({
  value,
  onChange,
  size = 220,
  className,
}) => {
  const color = value || '#3b82f6';
  const px = `${size}px`;

  return (
    <div className={cn('inline-block', className)} style={{ width: px }}>
      <div style={{ width: px }}>
        <HexColorPicker color={color} onChange={(c: string) => onChange(c)} />
      </div>
      <div className={cn('mt-2')}>
        <HexColorInput
          color={color}
          onChange={(c: string) => onChange(c)}
          prefixed
        />
      </div>
    </div>
  );
};

export default CircularColorPicker;
