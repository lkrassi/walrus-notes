import { cn } from '@/shared/lib/core';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
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

export const Tooltip: FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  disabled = false,
}) => {
  const tooltipId = useId();
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const portal = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  const getPosition = (anchorRect: DOMRect) => {
    let left = anchorRect.left + anchorRect.width / 2;
    let top = anchorRect.top;
    let transform = 'translate(-50%, calc(-100% - 8px))';

    switch (placement) {
      case 'top':
        left = anchorRect.left + anchorRect.width / 2;
        top = anchorRect.top;
        transform = 'translate(-50%, calc(-100% - 8px))';
        break;
      case 'bottom':
        left = anchorRect.left + anchorRect.width / 2;
        top = anchorRect.bottom;
        transform = 'translate(-50%, 8px)';
        break;
      case 'left':
        left = anchorRect.left;
        top = anchorRect.top + anchorRect.height / 2;
        transform = 'translate(calc(-100% - 8px), -50%)';
        break;
      case 'right':
        left = anchorRect.right;
        top = anchorRect.top + anchorRect.height / 2;
        transform = 'translate(8px, -50%)';
        break;
    }

    return { left, top, transform };
  };

  const adjustPosition = (
    left: number,
    top: number,
    transform: string,
    tooltipRect: DOMRect
  ) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let newLeft = left;
    let newTop = top;
    const newTransform = transform;

    const isTopBottom = transform.includes('Y') || transform.includes('(-100%');

    const tooltipRight = newLeft + tooltipRect.width / 2;
    const tooltipLeft = newLeft - tooltipRect.width / 2;
    if (tooltipLeft < 0) {
      newLeft = newLeft + Math.abs(tooltipLeft) + 8;
    } else if (tooltipRight > viewportWidth) {
      newLeft = newLeft - (tooltipRight - viewportWidth) - 8;
    }

    const tooltipBottom = newTop + (isTopBottom ? tooltipRect.height : 0);
    const tooltipTop = newTop - (isTopBottom ? tooltipRect.height : 0);
    if (tooltipTop < 0) {
      newTop = newTop + Math.abs(tooltipTop) + 8;
    } else if (tooltipBottom > viewportHeight) {
      newTop = newTop - (tooltipBottom - viewportHeight) - 8;
    }

    return { left: newLeft, top: newTop, transform: newTransform };
  };

  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!anchor || !tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const { left, top, transform } = getPosition(anchor);
    const {
      left: adjustedLeft,
      top: adjustedTop,
      transform: adjustedTransform,
    } = adjustPosition(left, top, transform, tooltipEl.getBoundingClientRect());

    setTooltipStyle({
      position: 'fixed',
      left: adjustedLeft,
      top: adjustedTop,
      transform: adjustedTransform,
      whiteSpace: 'normal',
      maxWidth: 'min(90vw, 280px)',
      wordBreak: 'break-word',
      textAlign: 'center',
      zIndex: 200,
    });
  }, [anchor, placement]);

  if (disabled) {
    return <>{children}</>;
  }

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
      {portal &&
        anchor &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role='tooltip'
            className={cn(
              'pointer-events-none rounded-md px-2 py-1 text-xs',
              'bg-foreground text-background border-border border'
            )}
            style={tooltipStyle}
          >
            {title}
          </span>,
          portal
        )}
    </span>
  );
};
