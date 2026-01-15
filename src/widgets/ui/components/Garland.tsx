import React from 'react';
import cn from 'shared/lib/cn';
import './garland.css';
import { useIsMobile } from 'widgets/hooks';

interface Props {
  active?: boolean;
}

export const Garland: React.FC<Props> = ({ active = true }) => {
  const isMobile = useIsMobile();
  const defaultCount = 8;
  const count = isMobile
    ? Math.max(6, Math.round(defaultCount * 0.6))
    : defaultCount;
  const bulbs = new Array(count).fill(0);

  return (
    <ul className={cn('lightrope', !active && 'off')} aria-hidden>
      {bulbs.map((_, i) => (
        <li key={i} />
      ))}
    </ul>
  );
};

export default Garland;
