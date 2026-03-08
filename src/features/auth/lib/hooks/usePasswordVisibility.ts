import { useState } from 'react';

export const usePasswordVisibility = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const toggleVisibility = () => setIsVisible(prev => !prev);

  return {
    isVisible,
    toggleVisibility,
  };
};
