import { Tooltip, tooltipObject } from '../Tooltip';
import { Point } from '../../Point';
import { Rectangle } from '../../Rectangle';

export const drawDateXBottom = function (this: Tooltip, t: tooltipObject) {
  t.ctx.strokeStyle = this._options.lineColor;
  t.ctx.lineWidth = this._options.lineWidth;
  t.ctx.fillStyle = this._options.brushColor;
  t.ctx.setLineDash(this._options.lineDash);

  // параметры
  const rectPadding = 4;
  const rectWidth = 85;

  // @ts-ignore
  const labelText = this.labels[t.ind].toLocaleDateString('en', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  const cornersRadius = this._options.mainSize;

  const labelCoord = new Point(t.coord.x, t.vp.y1);
  const labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

  let labelCenter = new Point(labelCoord.x, labelRect.y1 + labelRect.height * 0.5);

  let roundRect: Rectangle = new Rectangle(
    labelCenter.x - rectWidth * 0.5,
    labelCenter.y - rectPadding - labelRect.height * 0.5,
    labelCenter.x + rectWidth * 0.5,
    labelCenter.y + rectPadding + labelRect.height * 0.5
  );

  if (roundRect.x1 < t.vp.x1) {
    labelCoord.x = labelCoord.x + t.vp.x1 - roundRect.x1;
    roundRect.move(0, t.vp.x1 - roundRect.x1);
  }

  if (roundRect.x2 > t.vp.x2) {
    labelCoord.x = labelCoord.x - (roundRect.x2 - t.vp.x2);
    roundRect.move(0, -roundRect.x2 + t.vp.x2);
  }

  labelCenter = new Point(labelCoord.x, labelRect.y1 + labelRect.height * 0.5);

  roundRect = new Rectangle(
    labelCenter.x - rectWidth * 0.5,
    labelCenter.y - rectPadding - labelRect.height * 0.5 - 1,
    labelCenter.x + rectWidth * 0.5,
    labelCenter.y + rectPadding + labelRect.height * 0.5 - 1
  );

  this.roundRect(
    t.ctx,
    roundRect.x1,
    roundRect.y1,
    roundRect.width,
    roundRect.height,
    cornersRadius
  );

  t.ctx.fill();
  t.ctx.stroke();
  this.label.draw(t.ctx, labelCoord, labelText);

  return roundRect;
};
