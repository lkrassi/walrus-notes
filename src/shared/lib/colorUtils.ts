export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const colors = [
    '#FF6B6B', // Красный
    '#4ECDC4', // Бирюзовый
    '#45B7D1', // Голубой
    '#96CEB4', // Зелёный
    '#FFEAA7', // Жёлтый
    '#DFE6E9', // Серый
    '#74B9FF', // Синий
    '#A29BFE', // Фиолетовый
    '#FD79A8', // Розовый
    '#FDCB6E', // Оранжевый
    '#6C5CE7', // Индиго
    '#00B894', // Мятный
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
