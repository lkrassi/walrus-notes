import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/widgets/hooks';
import { type FC } from 'react';
import './garland.css';

interface Props {
  active?: boolean;
}

export const Garland: FC<Props> = ({ active = true }) => {
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
