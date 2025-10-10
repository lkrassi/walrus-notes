interface FileTreeContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const FileTreeContextMenu = ({ x, y, onClose }: FileTreeContextMenuProps) => {
  return (
    <>
      <div className='fixed inset-0 z-50' onClick={onClose} />
      <div
        className='dark:bg-dark-bg border-border dark:border-dark-border fixed z-50 min-w-[150px] rounded-lg border bg-white py-1 shadow-lg'
        style={{
          left: x,
          top: y,
        }}
      ></div>
    </>
  );
};
