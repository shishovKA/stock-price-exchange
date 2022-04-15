import { Tooltip, tooltipObject } from '../Tooltip';

export const drawBarChartFullHeight = function (this: Tooltip, t: tooltipObject) {
  const { ctx, step, coord, vp } = t;

  ctx.strokeStyle = this._options.lineColor;
  ctx.lineWidth = this._options.lineWidth;
  ctx.fillStyle = this._options.brushColor;

  const finalStep = step - this._options.mainSize;

  ctx.beginPath();
  ctx.lineTo(coord.x - finalStep * 0.5, ctx.canvas.height);
  ctx.lineTo(coord.x - finalStep * 0.5, 0);
  ctx.lineTo(coord.x + finalStep * 0.5, 0);
  ctx.lineTo(coord.x + finalStep * 0.5, ctx.canvas.height);
  ctx.closePath();
  ctx.fill();
};
