import { cn } from '@/shared/lib/core';
import type { AwarenessUser } from '@/shared/lib/react/collaboration';
import {
  memo,
  useEffect,
  useMemo,
  useState,
  type FC,
  type RefObject,
} from 'react';
import {
  getCaretOverlayPosition,
  getSelectionOverlayRects,
} from '../../../lib/yjs/textareaOverlayUtils';
import { Cursor } from './Cursor';
import { SelectionHighlight } from './SelectionHighlight';

interface RemoteCursorsLayerProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  users: AwarenessUser[];
  currentUserId: string;
}

interface OverlaySelectionRect {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
}

interface OverlayCursor {
  id: string;
  left: number;
  top: number;
  height: number;
  color: string;
  name: string;
}

interface OverlayState {
  cursors: OverlayCursor[];
  selections: OverlaySelectionRect[];
}

export const RemoteCursorsLayer: FC<RemoteCursorsLayerProps> = memo(
  function RemoteCursorsLayer({ textareaRef, users, currentUserId }) {
    const [overlay, setOverlay] = useState<OverlayState>({
      cursors: [],
      selections: [],
    });

    const remoteUsers = useMemo(() => {
      return users.filter(userState => {
        if (userState.isLocal === true) {
          return false;
        }

        if (typeof userState.isLocal === 'undefined') {
          return Boolean(
            userState.user?.id && userState.user.id !== currentUserId
          );
        }

        return Boolean(userState.user?.id);
      });
    }, [currentUserId, users]);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setOverlay({ cursors: [], selections: [] });
        return;
      }

      let rafId: number | null = null;

      const recalc = () => {
        if (!textareaRef.current) {
          return;
        }

        const currentTextarea = textareaRef.current;
        const cursors: OverlayCursor[] = [];
        const selections: OverlaySelectionRect[] = [];

        for (const userState of remoteUsers) {
          const user = userState.user;
          const cursor = userState.cursor;
          if (!user || !cursor) {
            continue;
          }

          const color = user.color || 'hsl(210, 80%, 60%)';

          const caret = getCaretOverlayPosition(currentTextarea, cursor.index);
          if (caret) {
            cursors.push({
              id: String(userState.clientId ?? user.id),
              left: caret.left,
              top: caret.top,
              height: caret.height,
              color,
              name: user.name || 'Anonymous',
            });
          }

          const rects = getSelectionOverlayRects(
            currentTextarea,
            cursor.selectionStart,
            cursor.selectionEnd
          );

          rects.forEach((rect, index) => {
            selections.push({
              id: `${userState.clientId ?? user.id}-${index}`,
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              color,
            });
          });
        }

        setOverlay({ cursors, selections });
      };

      const requestRecalc = () => {
        if (rafId !== null) {
          return;
        }
        rafId = requestAnimationFrame(() => {
          rafId = null;
          recalc();
        });
      };

      requestRecalc();

      textarea.addEventListener('scroll', requestRecalc, { passive: true });
      window.addEventListener('resize', requestRecalc);

      return () => {
        textarea.removeEventListener('scroll', requestRecalc);
        window.removeEventListener('resize', requestRecalc);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }, [remoteUsers, textareaRef]);

    if (!remoteUsers.length) {
      return null;
    }

    return (
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-50 overflow-hidden'
        )}
      >
        {overlay.selections.map(selection => (
          <SelectionHighlight
            key={selection.id}
            left={selection.left}
            top={selection.top}
            width={selection.width}
            height={selection.height}
            color={selection.color}
          />
        ))}

        {overlay.cursors.map(cursor => (
          <Cursor
            key={cursor.id}
            left={cursor.left}
            top={cursor.top}
            height={cursor.height}
            color={cursor.color}
            name={cursor.name}
          />
        ))}
      </div>
    );
  }
);
