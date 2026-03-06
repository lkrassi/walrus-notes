import { cn } from '@/shared/lib/cn';
import { type FC } from 'react';

interface ImageViewerModalProps {
  imageUrl: string;
  alt?: string;
}

export const ImageViewerModal: FC<ImageViewerModalProps> = ({
  imageUrl,
  alt = 'Изображение',
}) => {
  return (
    <div
      className={cn(
        'flex',
        'h-full',
        'w-full',
        'items-center',
        'justify-center',
        'p-4'
      )}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={cn('max-h-full', 'max-w-full', 'object-contain')}
      />
    </div>
  );
};
