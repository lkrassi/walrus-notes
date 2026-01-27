import { cn } from '../../../../shared/lib/cn';

interface ImageViewerModalProps {
  imageUrl: string;
  alt?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
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
