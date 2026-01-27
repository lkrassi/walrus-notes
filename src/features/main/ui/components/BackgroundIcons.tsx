import { motion } from 'framer-motion';
import { cn } from 'shared/lib/cn';

const icons = [
  <svg key='note' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
  </svg>,
  <svg key='link' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M12.586 4.586l2 2a2 2 0 010 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 000-5.656l-2-2a4 4 0 00-5.656 0 1 1 0 101.414 1.414 2 2 0 012.828 0z' />
    <path d='M7.414 15.414l-2-2a2 2 0 010-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 000 5.656l2 2a4 4 0 005.656 0 1 1 0 00-1.414-1.414 2 2 0 01-2.828 0z' />
  </svg>,
  <svg key='graph' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
  </svg>,
  <svg
    key='settings'
    className='h-8 w-8'
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path d='M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z' />
  </svg>,
  <svg key='folder' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
  </svg>,
  <svg
    key='lightning'
    className='h-8 w-8'
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path
      fillRule='evenodd'
      d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
      clipRule='evenodd'
    />
  </svg>,
  <svg key='star' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
  </svg>,
  <svg key='tag' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z'
      clipRule='evenodd'
    />
  </svg>,
  <svg key='cloud' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z' />
  </svg>,
  <svg key='heart' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
      clipRule='evenodd'
    />
  </svg>,
  <svg key='pencil' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
  </svg>,
  <svg key='book' className='h-8 w-8' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z' />
  </svg>,
];

const iconPositions = [
  { left: 15, top: 20 },
  { left: 35, top: 15 },
  { left: 55, top: 25 },
  { left: 75, top: 20 },
  { left: 10, top: 60 },
  { left: 30, top: 70 },
  { left: 50, top: 65 },
  { left: 70, top: 75 },
  { left: 85, top: 40 },
  { left: 20, top: 85 },
  { left: 65, top: 50 },
  { left: 90, top: 65 },
];

export const BackgroundIcons = () => {
  return (
    <>
      <motion.div
        className={cn(
          'fixed',
          '-left-10',
          'top-1/4',
          'z-[-1]',
          'h-72',
          'w-72',
          'rounded-full',
          'bg-primary/5',
          'blur-3xl'
        )}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className={cn(
          'fixed',
          '-right-10',
          'bottom-1/4',
          'z-[-1]',
          'h-96',
          'w-96',
          'rounded-full',
          'bg-purple-500/5',
          'blur-3xl'
        )}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 10, delay: 1 }}
      />

      {icons.map((icon, idx) => {
        const position = iconPositions[idx] || { left: 50, top: 50 };
        return (
          <motion.div
            key={idx}
            className={cn(
              'fixed',
              'z-[-1]',
              'text-2xl',
              'opacity-10',
              'text-primary'
            )}
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, idx % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 5 + idx * 0.5,
              delay: idx * 0.3,
            }}
          >
            {icon}
          </motion.div>
        );
      })}
    </>
  );
};
