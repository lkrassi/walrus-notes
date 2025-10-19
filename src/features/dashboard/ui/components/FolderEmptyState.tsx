import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from 'widgets/hooks/useDeviceType';
import { containerVariants } from './folder-empty-state/animations';
import { FloatingIcons } from './folder-empty-state/FloatingIcons';
import { FolderIcon } from './folder-empty-state/FolderIcon';
import { EmptyStateContent } from './folder-empty-state/EmptyStateContent';

interface FolderEmptyStateProps {
  folderTitle: string;
}

export const FolderEmptyState: React.FC<FolderEmptyStateProps> = ({
  folderTitle
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className="flex h-full items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`text-center relative ${isMobile ? 'px-4' : ''}`}>
        <FloatingIcons />
        <FolderIcon />
        <EmptyStateContent folderTitle={folderTitle} />
      </div>
    </motion.div>
  );
};
