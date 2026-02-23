import { memo, type FC } from 'react';

export const SafeImage: FC<{ src?: string; alt?: string; title?: string }> =
  memo(function SafeImage({ src = '', alt, title }) {
    if (
      !src.startsWith('http://') &&
      !src.startsWith('https://') &&
      !src.startsWith('data:')
    ) {
      return <span className='text-red-500'>[Unsafe image URL: {alt}]</span>;
    }
    return <img src={src} alt={alt} title={title} loading='lazy' />;
  });
