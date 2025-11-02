import { type ModalOptions } from '../../hooks/useModal';

export interface TriggerPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const calculateTriggerPosition = (
  element: HTMLElement
): TriggerPosition => {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
  };
};

export const createAnimatedModalOptions = (
  baseOptions: ModalOptions,
  triggerElement: HTMLElement
): ModalOptions => ({
  ...baseOptions,
  triggerPosition: calculateTriggerPosition(triggerElement),
});
