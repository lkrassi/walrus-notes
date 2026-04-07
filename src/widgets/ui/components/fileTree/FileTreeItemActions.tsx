import { cn } from '@/shared/lib/core';
import { MoreHorizontal, Network, Pencil, Share2, Trash2 } from 'lucide-react';
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
  onOpenGraph?: (e: ReactMouseEvent<HTMLElement>) => void;
  isMobile: boolean;
  titleShare?: string;
  titleEdit?: string;
  titleDelete?: string;
  titleOpenGraph?: string;
};

export const FileTreeItemActions: FC<Props> = ({
  onShare,
  onEdit,
  onDelete,
  onOpenGraph,
  isMobile,
  titleShare = 'Share',
  titleEdit = 'Edit',
  titleDelete = 'Delete',
  titleOpenGraph = 'Show Graph',
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
          'flex h-5 w-5 items-center justify-center',
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
            'mt-1',
            'w-40',
            'border-border',
            'dark:border-dark-border',
            'bg-bg',
            'dark:bg-dark-bg',
            'text-text',
            'dark:text-dark-text',
            'border',
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-1 opacity-0'
          )}
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
              'py-1.5',
              'flex',
              'items-center',
              'gap-2',
              'text-xs',
              'transition-colors',
              'hover:bg-muted-foreground/10'
            )}
            title={titleShare}
          >
            <Share2 className={cn('h-3.5', 'w-3.5')} />
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
              'py-1.5',
              'flex',
              'items-center',
              'gap-2',
              'text-xs',
              'transition-colors',
              'hover:bg-muted-foreground/10'
            )}
            title={titleEdit}
          >
            <Pencil className={cn('h-3.5', 'w-3.5')} />
            <span>{titleEdit}</span>
          </button>

          {onOpenGraph && (
            <button
              role='menuitem'
              onClick={e => {
                e.stopPropagation();
                setOpen(false);
                onOpenGraph(e);
              }}
              className={cn(
                'w-full',
                'text-left',
                'px-3',
                'py-1.5',
                'flex',
                'items-center',
                'gap-2',
                'text-xs',
                'transition-colors',
                'hover:bg-muted-foreground/10'
              )}
              title={titleOpenGraph}
            >
              <Network className={cn('h-3.5', 'w-3.5')} />
              <span>{titleOpenGraph}</span>
            </button>
          )}

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
              'py-1.5',
              'flex',
              'items-center',
              'gap-2',
              'text-xs',
              'text-danger',
              'transition-colors',
              'hover:bg-muted-foreground/10'
            )}
            title={titleDelete}
          >
            <Trash2 className={cn('h-3.5', 'w-3.5')} />
            <span>{titleDelete}</span>
          </button>
        </div>
      )}
    </div>
  );
};
