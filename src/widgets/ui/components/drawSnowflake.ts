export const drawSnowflake = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fillStyle: string
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = fillStyle;

  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 3) * i);

    ctx.fillRect(-0.7, -size, 1.4, size);

    const barSize = size * 0.3;
    ctx.fillRect(-barSize / 2, -size, barSize, size * 0.15);

    ctx.restore();
  }

  ctx.restore();
};