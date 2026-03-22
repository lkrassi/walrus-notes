import { cn } from '@/shared/lib/core';
import { MoreHorizontal } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEvent as ReactMouseEvent,
} from 'react';

type Props = {
  onShare: (e: ReactMouseEvent<HTMLElement>) => void;
  onEdit: (e: ReactMouseEvent<HTMLElement>) => void;
  onDelete: (e: ReactMouseEvent<HTMLElement>) => void;
  isMobile: boolean;
  titleShare?: string;
  titleEdit?: string;
  titleDelete?: string;
};

export const FileTreeItemActions: FC<Props> = ({
  onShare,
  onEdit,
  onDelete,
  isMobile,
  titleShare = 'Share',
  titleEdit = 'Edit',
  titleDelete = 'Delete',
}) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: globalThis.MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        if (open) {
          setOpen(false);
          // wait for animation then unmount
          setTimeout(() => setMounted(false), 150);
        }
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', 'inline-flex')}>
      <button
        onClick={e => {
          e.stopPropagation();
          if (!mounted) {
            setMounted(true);
            // next tick to allow mount -> animate
            requestAnimationFrame(() => setOpen(true));
            return;
          }

          if (open) {
            setOpen(false);
            setTimeout(() => setMounted(false), 150);
          } else {
            setOpen(true);
          }
        }}
        className={cn(
          'transition-opacity',
          'duration-150',
          'opacity-100',
          isMobile
            ? 'text-gray-600 dark:text-white'
            : 'text-text/50 dark:text-dark-text/50 hover:text-text dark:hover:text-dark-text'
        )}
        aria-haspopup='menu'
        aria-expanded={open}
        title='More'
        type='button'
      >
        <MoreHorizontal className={cn('h-4', 'w-4')} />
      </button>

      {mounted && (
        <div
          role='menu'
          className={cn(
            'absolute',
            'right-0',
            'top-full',
            'z-50',
            'mt-2',
            'w-40',
            'rounded-lg',
            'shadow-lg',
            'backdrop-blur-sm',
            'border-border',
            'bg-surface/95',
            'border',
            'py-1',
            'transition-all',
            'duration-150',
            'ease-out',
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-1 opacity-0'
          )}
          style={{ transformOrigin: 'top right' }}
        >
          <button
            role='menuitem'
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
              onShare(e);
            }}
            className={cn(
              'w-full',
              'text-left',
              'px-3',
              'py-2',
              'flex',
              'items-center',
              'gap-2',
              'text-sm',
              'hover:bg-muted-foreground/10',
              'dark:hover:bg-dark-bg'
            )}
            title={titleShare}
          >
            <span>{titleShare}</span>
          </button>

          <button
            role='menuitem'
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
              onEdit(e);
            }}
            className={cn(
              'w-full',
              'text-left',
              'px-3',
              'py-2',
              'flex',
              'items-center',
              'gap-2',
              'text-sm',
              'hover:bg-muted-foreground/10',
              'dark:hover:bg-dark-bg'
            )}
            title={titleEdit}
          >
            <span>{titleEdit}</span>
          </button>

          <button
            role='menuitem'
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
              onDelete(e);
            }}
            className={cn(
              'w-full',
              'text-left',
              'px-3',
              'py-2',
              'flex',
              'items-center',
              'gap-2',
              'text-sm',
              'hover:bg-muted-foreground/10',
              'dark:hover:bg-dark-bg'
            )}
            title={titleDelete}
          >
            <span>{titleDelete}</span>
          </button>
        </div>
      )}
    </div>
  );
};
