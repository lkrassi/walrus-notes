import { useEffect } from 'react';
import type {
  EdgeDeleteEventDetail,
  EdgeDeleteHoverEventDetail,
} from '../../model/types';

export const useEdgeDeleteEvents = (
  onDrop: (event: CustomEvent<EdgeDeleteEventDetail>) => void,
  onStart: (event: CustomEvent<EdgeDeleteEventDetail>) => void,
  onHover?: (event: CustomEvent<EdgeDeleteHoverEventDetail>) => void
) => {
  useEffect(() => {
    const handleDrop = (event: Event) => {
      onDrop(event as CustomEvent<EdgeDeleteEventDetail>);
    };

    const handleStart = (event: Event) => {
      onStart(event as CustomEvent<EdgeDeleteEventDetail>);
    };

    const handleHover = (event: Event) => {
      onHover?.(event as CustomEvent<EdgeDeleteHoverEventDetail>);
    };

    document.addEventListener('edgeDeleteDrop', handleDrop);
    document.addEventListener('edgeDeleteStart', handleStart);
    document.addEventListener('edgeDeleteHover', handleHover);

    return () => {
      document.removeEventListener('edgeDeleteDrop', handleDrop);
      document.removeEventListener('edgeDeleteStart', handleStart);
      document.removeEventListener('edgeDeleteHover', handleHover);
    };
  }, [onDrop, onStart, onHover]);
};
