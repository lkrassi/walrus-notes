import { useMemo } from 'react';

interface UseEditorDimensionsProps {
  isDesktop: boolean;
  isEditing: boolean;
  leftWidth?: number | null;
}

export const useEditorDimensions = ({
  isDesktop,
  isEditing,
  leftWidth,
}: UseEditorDimensionsProps) => {
  const widthValue = useMemo(() => {
    if (isDesktop) {
      if (isEditing) return leftWidth ? `${leftWidth}px` : '480px';
      return '0px';
    }
    return isEditing ? '50%' : '0%';
  }, [isDesktop, isEditing, leftWidth]);

  const heightValue = useMemo(() => {
    if (isDesktop) return '100%';
    return isEditing ? '50%' : '0%';
  }, [isDesktop, isEditing]);

  return { widthValue, heightValue };
};
