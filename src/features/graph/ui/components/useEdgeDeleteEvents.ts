import { useEffect } from 'react';

interface EdgeDeleteEventDetail {
  edgeId: string;
  source: string;
  target: string;
  newTarget?: string | null;
}

export const useEdgeDeleteEvents = (
  onDrop: (event: CustomEvent<EdgeDeleteEventDetail>) => void,
  onStart: () => void
) => {
  useEffect(() => {
    const handleDrop = (event: Event) => {
      onDrop(event as CustomEvent<EdgeDeleteEventDetail>);
    };

    const handleStart = () => onStart();

    document.addEventListener('edgeDeleteDrop', handleDrop);
    document.addEventListener('edgeDeleteStart', handleStart);

    return () => {
      document.removeEventListener('edgeDeleteDrop', handleDrop);
      document.removeEventListener('edgeDeleteStart', handleStart);
    };
  }, [onDrop, onStart]);
};

export default useEdgeDeleteEvents;
