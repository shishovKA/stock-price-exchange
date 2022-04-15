import { Tooltip, tooltipObject } from '../Tooltip';
import { Point } from '../../Point';
import { Rectangle } from '../../Rectangle';

export const drawLabelSquareMarker = function (this: Tooltip, t: tooltipObject) {
  const { ctx, step, coord, vp, ind } = t;

  ctx.strokeStyle = this._options.lineColor;
  ctx.lineWidth = this._options.lineWidth;
  ctx.fillStyle = this._options.brushColor;
  ctx.setLineDash(this._options.lineDash);

  // @ts-ignore
  const labelText = this.labels[ind];
  const labelCoord = new Point(coord.x, coord.y);
  const labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

  const markerCoord = new Point(labelRect.x1 - 5, labelRect.midY);
  const markerSize = this._options.mainSize;

  ctx.beginPath();
  ctx.rect(markerCoord.x - markerSize, markerCoord.y - markerSize * 0.5, markerSize, markerSize);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  this.label.draw(t.ctx, labelCoord, labelText);
};
