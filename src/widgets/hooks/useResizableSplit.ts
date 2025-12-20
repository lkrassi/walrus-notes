import useResizableBase from './useResizableBase';

type Options = {
  storageKey?: string;
  defaultLeft?: number;
  min?: number;
  max?: number;
};

export const useResizableSplit = ({
  storageKey,
  defaultLeft = 480,
  min = 200,
  max = 1200,
}: Options = {}) => {
  const base = useResizableBase({
    storageKey,
    defaultSize: defaultLeft,
    min,
    max,
  });

  return {
    leftWidth: base.size,
    setLeftWidth: base.setSize,
    onDividerPointerDown: base.onPointerDown,
    min,
    max,
    isResizing: base.isResizing,
  } as const;
};

export default useResizableSplit;
