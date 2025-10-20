import { motion } from 'framer-motion';
import React from 'react';
import type { FileTreeItem } from 'widgets/hooks';
import { useIsMobile } from 'widgets/hooks/useDeviceType';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useGetNotesQuery } from 'widgets/model/stores/api';
import { EmptyLayoutState } from '../../../notes';

interface FolderWithNotesProps {
  folderItem: FileTreeItem;
}

export const FolderWithNotes: React.FC<FolderWithNotesProps> = ({
  folderItem,
}) => {
  const { t } = useLocalization();
  const isMobile = useIsMobile();

  const { data: notesResponse, isLoading } = useGetNotesQuery({
    layoutId: folderItem.id,
    page: 1,
  });

  const notes = notesResponse?.data || [];

  if (notes.length === 0) {
    return <EmptyLayoutState layoutTitle={folderItem.title} />;
  }

  return (
    <motion.div
      className='flex h-full items-center justify-center'
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`relative text-center ${isMobile ? 'px-4' : ''}`}>
        <motion.div
          className='mb-6'
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className='text-secondary dark:text-dark-secondary mx-auto mb-4 h-20 w-20'>
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' />
            </svg>
          </div>
        </motion.div>

        <motion.h3
          className={`text-text dark:text-dark-text mb-3 font-semibold ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {folderItem.title}
        </motion.h3>

        <motion.div
          className={`flex items-center justify-center space-x-2 text-gray-500 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.span
            animate={{
              x: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ←
          </motion.span>
          <span>{t('dashboard:selectNoteFromFolder')}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
