import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

/**
 * Хук для настройки сенсоров dnd-kit с поддержкой:
 * - MouseSensor: перетаскивание мышью на десктопе
 * - TouchSensor: перетаскивание на тач-устройствах (смартфоны, планшеты)
 * - KeyboardSensor: управление с клавиатуры для доступности
 *
 * activationConstraint.distance предотвращает случайное срабатывание
 * при попытке скролла или клика
 *
 * @param options - опциональные параметры для кастомизации сенсоров
 */
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
