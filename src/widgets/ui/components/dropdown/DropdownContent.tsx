import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import cn from '../../../../shared/lib/cn';

export type DropdownContentState = 'loading' | 'content' | 'empty' | 'error';

interface DropdownContentProps {
  isOpen: boolean;
  state: DropdownContentState;
  children: React.ReactNode;
  emptyContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  className?: string;
  animationDuration?: number;
  maxHeight?: string;
  onReachEnd?: () => void;
  reachMargin?: string; // rootMargin for IntersectionObserver
  reachDebounceMs?: number; // debounce/throttle interval for onReachEnd
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
  isOpen,
  state,
  children,
  emptyContent,
  errorContent,
  className = '',
  animationDuration = 0.2,
  maxHeight = 'max-h-full',
  onReachEnd,
  reachMargin = '200px',
  reachDebounceMs = 800,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const isThrottledRef = React.useRef(false);

  React.useEffect(() => {
    if (!onReachEnd) return;

    let io: IntersectionObserver | null = null;
    let retryTimer: number | null = null;

    const setupObserver = () => {
      const container = containerRef.current;
      const sentinel = sentinelRef.current;

      if (!container || !sentinel) {
        return false;
      }

      // mounted

      // prefer the nearest scrollable ancestor as the observer root; fallback to viewport
      const findScrollParent = (el: Element | null): Element | null => {
        let node: Element | null = el?.parentElement ?? null;
        while (node) {
          try {
            const style = window.getComputedStyle(node);
            const overflowY = style.overflowY;
            if (
              (overflowY === 'auto' || overflowY === 'scroll') &&
              node.scrollHeight > node.clientHeight
            ) {
              return node;
            }
          } catch (_e) {}
          node = node.parentElement;
        }
        return null;
      };

      const rootForObserver = findScrollParent(container) ?? null; // null -> viewport
      // observer root chosen

      io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // sentinel intersecting

              if (isThrottledRef.current) {
                return;
              }

              isThrottledRef.current = true;
              onReachEnd();

              // clear throttle after debounce interval
              window.setTimeout(() => {
                isThrottledRef.current = false;
              }, reachDebounceMs);
            }
          });
        },
        { root: rootForObserver, rootMargin: reachMargin }
      );

      io.observe(sentinel);
      return true;
    };

    // try immediate setup; if refs missing (often due to framer-motion animation), retry once after a short delay
    const ok = setupObserver();
    if (!ok) {
      retryTimer = window.setTimeout(() => {
        try {
          setupObserver();
        } catch (_e) {}
      }, 60) as unknown as number;
    }

    return () => {
      if (io) io.disconnect();
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [onReachEnd, reachMargin, isOpen, state, reachDebounceMs]);

  React.useEffect(() => {
    // refs status debug removed
  }, [isOpen, state]);

  const renderContent = () => {
    switch (state) {
      case 'empty':
        return (
          emptyContent || (
            <div className={cn('text-sm', 'text-gray-500')}>Пусто</div>
          )
        );
      case 'error':
        return (
          errorContent || (
            <div className={cn('text-sm', 'text-red-500')}>Ошибка</div>
          )
        );
      case 'content':
        return (
          <div className={cn('overflow-y-auto', maxHeight)} ref={containerRef}>
            {children}
            {/* sentinel element observed to trigger onReachEnd when user scrolls near bottom */}
            {onReachEnd && (
              <div ref={sentinelRef} style={{ width: '100%', height: 1 }} />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          key={state}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className={cn(className, 'w-full')}
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
