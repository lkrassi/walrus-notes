import useResizableBase from './useResizableBase';

const STORAGE_KEY = 'wn.sidebar.width';
const DEFAULT = 320;
const MIN = 200;
const MAX = 700;

export const useResizableSidebar = () => {
  const base = useResizableBase({
    storageKey: STORAGE_KEY,
    defaultSize: DEFAULT,
    min: MIN,
    max: MAX,
  });
  return {
    width: base.size,
    setWidth: base.setSize,
    onPointerDown: base.onPointerDown,
    min: base.min,
    max: base.max,
  } as const;
};

export default useResizableSidebar;
