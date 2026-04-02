import { cn } from '@/shared/lib/core';
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  title: string;
  children: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

const placementClasses: Record<
  NonNullable<TooltipProps['placement']>,
  string
> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
};

export const Tooltip: FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  disabled = false,
}) => {
  const tooltipId = useId();
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const portal = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  useEffect(() => {
    if (!anchor) return;

    const update = () => {
      const el = document.getElementById(tooltipId);
      if (!el) return;
      const rect = el.parentElement?.getBoundingClientRect();
      if (rect) setAnchor(rect);
    };

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchor, tooltipId]);

  if (disabled) {
    return <>{children}</>;
  }

  const tooltipStyle = anchor
    ? {
        position: 'fixed' as const,
        left:
          placement === 'left'
            ? anchor.left
            : placement === 'right'
              ? anchor.right
              : anchor.left + anchor.width / 2,
        top:
          placement === 'top'
            ? anchor.top
            : placement === 'bottom'
              ? anchor.bottom
              : anchor.top + anchor.height / 2,
      }
    : undefined;

  const tooltipNode =
    anchor && portal ? (
      <span
        id={tooltipId}
        role='tooltip'
        className={cn(
          'pointer-events-none z-200 rounded-md px-2 py-1 text-xs whitespace-nowrap',
          'bg-foreground text-background border-border border opacity-0 shadow-md transition-opacity duration-150'
        )}
        style={tooltipStyle}
      >
        {title}
      </span>
    ) : null;

  return (
    <span
      className='group relative inline-flex'
      aria-describedby={tooltipId}
      onMouseEnter={event =>
        setAnchor(event.currentTarget.getBoundingClientRect())
      }
      onFocus={event => setAnchor(event.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setAnchor(null)}
      onBlur={() => setAnchor(null)}
    >
      {children}
      {portal && anchor
        ? createPortal(
            <span
              id={tooltipId}
              role='tooltip'
              className={cn(
                'pointer-events-none z-200 rounded-md px-2 py-1 text-xs whitespace-nowrap',
                'bg-foreground text-background border-border border opacity-100 shadow-md transition-opacity duration-150'
              )}
              style={{
                position: 'fixed',
                left:
                  placement === 'left'
                    ? anchor.left
                    : placement === 'right'
                      ? anchor.right
                      : anchor.left + anchor.width / 2,
                top:
                  placement === 'top'
                    ? anchor.top
                    : placement === 'bottom'
                      ? anchor.bottom
                      : anchor.top + anchor.height / 2,
                transform:
                  placement === 'top'
                    ? 'translate(-50%, calc(-100% - 8px))'
                    : placement === 'bottom'
                      ? 'translate(-50%, 8px)'
                      : placement === 'left'
                        ? 'translate(calc(-100% - 8px), -50%)'
                        : 'translate(8px, -50%)',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>,
            portal
          )
        : null}
    </span>
  );
};
