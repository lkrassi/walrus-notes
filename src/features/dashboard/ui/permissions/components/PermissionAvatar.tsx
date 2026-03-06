import { type FC, useMemo, useState } from 'react';
import { cn } from 'shared/lib/cn';

interface PermissionAvatarProps {
  name: string;
  avatarUrl?: string;
}

const getInitials = (name: string) => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
};

export const PermissionAvatar: FC<PermissionAvatarProps> = ({
  name,
  avatarUrl,
}) => {
  const [isBroken, setIsBroken] = useState(false);

  const normalizedAvatarUrl = useMemo(() => {
    if (!avatarUrl || avatarUrl.trim().length === 0) {
      return '';
    }

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    return `https://${avatarUrl}`;
  }, [avatarUrl]);

  if (normalizedAvatarUrl && !isBroken) {
    return (
      <img
        src={normalizedAvatarUrl}
        alt={name}
        className={cn('h-10 w-10 rounded-full object-cover')}
        loading='lazy'
        onError={() => setIsBroken(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-primary/15 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold'
      )}
      aria-hidden='true'
    >
      {getInitials(name)}
    </div>
  );
};
