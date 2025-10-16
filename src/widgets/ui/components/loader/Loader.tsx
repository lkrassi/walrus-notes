import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-black/50 dark:bg-white  rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-black/50 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-black/50 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};
