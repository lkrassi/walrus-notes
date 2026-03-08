import { Notification } from '@/app/providers/notifications/Notification';
import { useNotifications } from '@/app/providers/notifications/useNotifications';
import { Transition } from '@headlessui/react';
import { Fragment, useEffect, type FC } from 'react';

export const NotificationsContainer: FC = () => {
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

  return (
    <div
      className='pointer-events-none fixed right-4 bottom-4 z-250 flex max-h-[60vh] w-[min(420px,calc(100vw-2rem))] flex-col-reverse gap-2 overflow-hidden'
      aria-live='polite'
    >
      {notifications.map(notification => (
        <Transition
          key={notification.id}
          as={Fragment}
          appear
          show
          enter='transform transition duration-200 ease-out'
          enterFrom='translate-y-2 opacity-0 scale-95'
          enterTo='translate-y-0 opacity-100 scale-100'
          leave='transform transition duration-150 ease-in'
          leaveFrom='translate-y-0 opacity-100 scale-100'
          leaveTo='translate-y-2 opacity-0 scale-95'
        >
          <div className='pointer-events-auto'>
            <Notification
              notification={notification}
              onClose={id => hideNotification(id)}
            />
          </div>
        </Transition>
      ))}
    </div>
  );
};
