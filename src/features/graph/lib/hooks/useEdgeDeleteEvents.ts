import { useEffect } from 'react';
import type { EdgeDeleteEventDetail } from '../../model/types';

export const useEdgeDeleteEvents = (
  onDrop: (event: CustomEvent<EdgeDeleteEventDetail>) => void,
  onStart: (event: CustomEvent<EdgeDeleteEventDetail>) => void
) => {
  useEffect(() => {
    const handleDrop = (event: Event) => {
      onDrop(event as CustomEvent<EdgeDeleteEventDetail>);
    };

    const handleStart = (event: Event) => {
      onStart(event as CustomEvent<EdgeDeleteEventDetail>);
    };

    document.addEventListener('edgeDeleteDrop', handleDrop);
    document.addEventListener('edgeDeleteStart', handleStart);

    return () => {
      document.removeEventListener('edgeDeleteDrop', handleDrop);
      document.removeEventListener('edgeDeleteStart', handleStart);
    };
  }, [onDrop, onStart]);
};
