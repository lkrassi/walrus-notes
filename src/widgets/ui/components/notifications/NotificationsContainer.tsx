import React, { useEffect } from 'react';
import cn from 'shared/lib/cn';
import { useNotifications } from 'widgets/hooks';
import { Notification } from 'widgets/ui/components/notifications/Notification';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const NotificationsContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotifications();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          hideNotification(notification.id);
        }, notification.duration);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, hideNotification]);

  if (notifications.length === 0) {
    return null;
  }

  const itemVariants: Variants = {
    hidden: (_i: number) => ({ x: 200, opacity: 0 }),
    enter: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 700,
        damping: 28,
        delay: i * 0.06,
      },
    }),
    exit: (_i: number) => ({
      x: 240,
      opacity: 0,
      transition: { duration: 0.18 },
    }),
  };

  return (
    <div
      className={cn(
        'fixed',
        'right-4',
        'bottom-4',
        'flex',
        'flex-col',
        'gap-3',
        'z-150'
      )}
    >
      <AnimatePresence>
        {notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            className={cn('w-full')}
            initial='hidden'
            animate='enter'
            exit='exit'
            variants={itemVariants}
            custom={idx}
            layout
          >
            <Notification notification={notification} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
