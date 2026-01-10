import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';


export const useDndSensors = (options?: {
  mouseDistance?: number;
  touchDelay?: number;
  touchTolerance?: number;
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: options?.mouseDistance ?? 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: options?.touchDelay ?? 150,
        tolerance: options?.touchTolerance ?? 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  return sensors;
};
