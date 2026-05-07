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
    <div ref={ref} className='relative inline-flex'>
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
          'flex-center h-5 w-5',
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
            'menu-popup-surface',
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
            className='menu-item-btn'
            title={titleShare}
          >
            <Share2 className='h-3.5 w-3.5' />
            <span>{titleShare}</span>
          </button>

          <button
            role='menuitem'
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
              onEdit(e);
            }}
            className='menu-item-btn'
            title={titleEdit}
          >
            <Pencil className='h-3.5 w-3.5' />
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
              className='menu-item-btn'
              title={titleOpenGraph}
            >
              <Network className='h-3.5 w-3.5' />
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
            className='menu-item-btn text-danger'
            title={titleDelete}
          >
            <Trash2 className='h-3.5 w-3.5' />
            <span>{titleDelete}</span>
          </button>
        </div>
      )}
    </div>
  );
};
