import { cn } from '@/shared/lib/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, type FC, type ReactNode } from 'react';

export type DropdownContentState = 'loading' | 'content' | 'empty' | 'error';

interface DropdownContentProps {
  isOpen: boolean;
  state: DropdownContentState;
  children: ReactNode;
  emptyContent?: ReactNode;
  errorContent?: ReactNode;
  className?: string;
  animationDuration?: number;
  maxHeight?: string;
  onReachEnd?: () => void;
  reachMargin?: string;
  reachDebounceMs?: number;
}

const findScrollParent = (el: Element | null): Element | null => {
  let node: Element | null = el?.parentElement ?? null;
  while (node) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

export const DropdownContent: FC<DropdownContentProps> = ({
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isThrottledRef = useRef(false);
  const throttleResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!onReachEnd || !isOpen || state !== 'content') return;

    let io: IntersectionObserver | null = null;
    let retryTimer: number | null = null;

    isThrottledRef.current = false;

    const setupObserver = () => {
      const container = containerRef.current;
      const sentinel = sentinelRef.current;

      if (!container || !sentinel) {
        return false;
      }

      const rootForObserver = findScrollParent(container) ?? null;

      io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (isThrottledRef.current) {
                return;
              }

              isThrottledRef.current = true;
              onReachEnd();

              if (throttleResetTimerRef.current) {
                clearTimeout(throttleResetTimerRef.current);
              }

              throttleResetTimerRef.current = window.setTimeout(() => {
                isThrottledRef.current = false;
                throttleResetTimerRef.current = null;
              }, reachDebounceMs);
            }
          });
        },
        { root: rootForObserver, rootMargin: reachMargin }
      );

      io.observe(sentinel);
      return true;
    };

    const ok = setupObserver();
    if (!ok) {
      retryTimer = window.setTimeout(() => {
        setupObserver();
      }, 60);
    }

    return () => {
      if (io) io.disconnect();
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (throttleResetTimerRef.current) {
        clearTimeout(throttleResetTimerRef.current);
      }
      throttleResetTimerRef.current = null;
      isThrottledRef.current = false;
    };
  }, [onReachEnd, reachMargin, isOpen, state, reachDebounceMs]);

  const renderContent = () => {
    switch (state) {
      case 'empty':
        return emptyContent;
      case 'error':
        return (
          errorContent || (
            <div className={cn('text-sm', 'text-danger')}>Ошибка</div>
          )
        );
      case 'content':
        return (
          <div className={cn('overflow-y-auto', maxHeight)} ref={containerRef}>
            {children}
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
