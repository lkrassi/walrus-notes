interface ImageViewerModalProps {
  imageUrl: string;
  alt?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  alt = 'Изображение',
}) => {
  return (
    <div className='flex h-full w-full items-center justify-center p-4'>
      <img
        src={imageUrl}
        alt={alt}
        className='max-h-full max-w-full object-contain'
      />
    </div>
  );
};
