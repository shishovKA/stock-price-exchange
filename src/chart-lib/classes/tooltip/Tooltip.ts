import { Rectangle } from '../Rectangle';
import { Point } from '../Point';
import { Label } from '../Label';

interface tooltipDrawOptions {
  lineWidth: number;
  lineColor: string;
  brushColor: string;
  mainSize: number;
  lineDash: number[];
}

export interface tooltipObject {
  ctx: CanvasRenderingContext2D;
  vp: Rectangle;
  coord: Point;
  data: Point;
  ind: number;
  step: number;
  toDraw: boolean;
}
// drawing methods
import { drawBarChartHighLighter } from './drawings/bar-chart-highlighter';
import { drawBarChartFullHeight } from './drawings/bar-chart-fullheight';
import { drawDateXBottom } from './drawings/date-x-bottom';
import { drawLabelSquareMarker } from './drawings/label-with-markers';

//описание класса

export class Tooltip {
  _id: string;
  type: string;
  _options: tooltipDrawOptions;
  labels?: any[];
  label: Label;

  constructor(id: string, type: string, ...options: any) {
    this._id = id;
    this.type = type;

    this._options = {
      lineWidth: 1,
      lineColor: '#000000',
      brushColor: '#000000',
      mainSize: 2,
      lineDash: [],
    };

    this.label = new Label();

    //if (labels) this.labels = labels;

    this.setOptions(options);
  }

  get id(): string {
    return this._id;
  }

  setOptionsPartially(options: Partial<tooltipDrawOptions>) {
    this._options = { ...this._options, ...options };
    return this;
  }

  setOptions(options: any[]) {
    switch (this.type) {
      case 'bar_chart_highlighter':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'bar_chart_fullheight':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'circle_series':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'line_vertical_full':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.lineDash = options[2];
        break;

      case 'line_horizontal_end':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.lineDash = options[2];
        break;

      case 'label_x_start':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        this.labels = options[4];
        break;

      case 'date_x_bottom':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        this.labels = options[4];
        break;

      case 'circle_y_end':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'data_y_end':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'delta_abs':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'data_label':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this.labels = options[3];
        break;

      case 'text_line_loss':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this.labels = options[3];
        break;

      case 'simple_label':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this.labels = options[3];
        break;

      //simple_label_square_markers

      case 'simple_label_square_markers':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        this.labels = options[4];
        break;
    }
  }

  drawTooltip(t: tooltipObject) {
    switch (this.type) {
      case 'date_x_bottom':
        drawDateXBottom.call(this, t);
        break;

      case 'bar_chart_highlighter':
        drawBarChartHighLighter.call(this, t);
        break;

      case 'bar_chart_fullheight':
        drawBarChartFullHeight.call(this, t);
        break;

      case 'circle_series':
        this.drawCircleSeries(t);
        break;

      case 'line_vertical_full':
        this.drawLineVerticalFull(t);
        break;

      case 'line_horizontal_end':
        this.drawLineHorizontalEnd(t);
        break;

      case 'label_x_start':
        this.drawLabelXStart(t);
        break;

      case 'circle_y_end':
        this.drawCircleYEnd(t);
        break;

      case 'data_y_end':
        return this.drawDataYEnd(t);

      case 'delta_abs':
        this.drawDeltaAbs(t);
        break;

      case 'data_label':
        this.drawDataLabel(t);
        break;

      case 'text_line_loss':
        this.drawTextLine(t);
        break;

      case 'simple_label':
        this.drawSimpleLabel(t);
        break;

      case 'simple_label_square_markers':
        // this.drawSimpleLabel(t);
        drawLabelSquareMarker.call(this, t);
        break;
    }
  }

  drawTextLine(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    // @ts-ignore
    const labelText = this.labels[t.ind];
    const labelCoord = new Point(t.coord.x - t.step * 0.45, t.coord.y);

    this.label.draw(t.ctx, labelCoord, labelText);
  }

  drawSimpleLabel(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    // @ts-ignore
    const labelText = this.labels[t.ind];
    const labelCoord = new Point(t.coord.x, t.coord.y);

    this.label.draw(t.ctx, labelCoord, labelText);
    // console.log(labelCoord, labelText);
  }

  drawDataLabel(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    const labelCoord = new Point(t.coord.x, t.coord.y);

    //параметры начальные
    this.label.position = 'top';
    const lineX = t.coord.x;

    const rectPadding = 6;

    const labelText =
      // @ts-ignore
      this.labels[t.ind] + '; x: ' + t.data.x.toFixed(1) + '; y: ' + t.data.y.toFixed(1);
    const cornersRadius = this._options.mainSize;

    let labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

    let roundRect: Rectangle = new Rectangle(
      labelRect.x1 - rectPadding,
      labelRect.y1 - rectPadding,
      labelRect.x2 + rectPadding,
      labelRect.y2 + rectPadding
    );

    /*
        if (roundRect.x2 > vp.x2) {
            labelCoord.x = labelCoord.x - roundRect.x2 + vp.x2;
            roundRect.move(- roundRect.x2 + vp.x2, 0)
        }
*/

    if (roundRect.x2 > t.vp.x2) {
      labelCoord.x = labelCoord.x - Math.abs(roundRect.x2 - t.vp.x2) - rectPadding;

      labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

      roundRect = new Rectangle(
        labelRect.x1 - rectPadding,
        labelRect.y1 - rectPadding,
        labelRect.x2 + rectPadding,
        labelRect.y2 + rectPadding
      );
    }

    if (roundRect.x1 < t.vp.x1) {
      labelCoord.x = labelCoord.x + Math.abs(roundRect.x1 - t.vp.x1) + rectPadding;

      labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

      roundRect = new Rectangle(
        labelRect.x1 - rectPadding,
        labelRect.y1 - rectPadding,
        labelRect.x2 + rectPadding,
        labelRect.y2 + rectPadding
      );
    }

    if (roundRect.y1 < t.vp.y1) {
      this.label.position = 'bottom';
      labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

      roundRect = new Rectangle(
        labelRect.x1 - rectPadding,
        labelRect.y1 - rectPadding,
        labelRect.x2 + rectPadding,
        labelRect.y2 + rectPadding
      );

      //labelCoord.y = labelCoord.y + vp.y1 - roundRect.y1;
      //roundRect.move(0, vp.y1 - roundRect.y1);
    }

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
  }

  drawCircleSeries(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);
    t.ctx.beginPath();
    t.ctx.arc(t.coord.x, t.coord.y, this._options.mainSize, 0, Math.PI * 2, true);
    t.ctx.closePath();
    t.ctx.fill();
    t.ctx.stroke();
  }

  drawLineVerticalFull(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.setLineDash(this._options.lineDash);
    t.ctx.beginPath();
    t.ctx.moveTo(t.coord.x, t.vp.y1);
    t.ctx.lineTo(t.coord.x, t.vp.zeroY);
    t.ctx.stroke();
    t.ctx.setLineDash([]);
  }

  drawLineHorizontalEnd(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.setLineDash(this._options.lineDash);
    t.ctx.beginPath();
    t.ctx.moveTo(t.coord.x, t.coord.y);
    t.ctx.lineTo(t.vp.x2, t.coord.y);
    t.ctx.stroke();
    t.ctx.setLineDash([]);
  }

  drawLabelXStart(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    // параметры
    const rectPadding = 6;
    const rectWidth = 60;

    // @ts-ignore
    const labelText = this.labels[t.ind].toLocaleDateString('en');
    const cornersRadius = this._options.mainSize;

    const labelCoord = new Point(t.coord.x, t.vp.zeroY);
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
      labelCenter.y - rectPadding - labelRect.height * 0.5,
      labelCenter.x + rectWidth * 0.5,
      labelCenter.y + rectPadding + labelRect.height * 0.5
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
  }

  roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  drawCircleYEnd(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);
    t.ctx.beginPath();
    t.ctx.arc(t.vp.x2, t.coord.y, this._options.mainSize, 0, Math.PI * 2, true);
    t.ctx.closePath();
    t.ctx.fill();
    t.ctx.stroke();
  }

  drawDataYEnd(t: tooltipObject): Rectangle {
    const ttCoord = new Point(t.coord.x, t.coord.y);

    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    // параметры
    const rectPadding = 6;
    const labelText = t.data.y.toString();
    const cornersRadius = this._options.mainSize;

    this.label.position = 'right';

    const labelCoord = new Point(t.vp.x2, ttCoord.y);

    const labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);

    const labelStart = new Point(labelRect.x1, labelRect.y1);
    const labelCenter = new Point(labelRect.x1 + labelRect.width * 0.5, labelCoord.y);

    let roundRectWidth = 40;
    if (labelRect.width > roundRectWidth) roundRectWidth = labelRect.width * 1.1;

    const roundRect: Rectangle = new Rectangle(
      labelCenter.x - roundRectWidth * 0.5,
      labelStart.y - rectPadding,
      labelCenter.x + roundRectWidth * 0.5,
      labelStart.y + labelRect.height + rectPadding
    );

    /*
        let roundRect: Rectangle = new Rectangle(vp.x2 + 11 - rectPadding + 3,
            labelStart.y - rectPadding,
            vp.x2 + rectPadding + 35 + 3,
            labelStart.y  + labelRect.height + rectPadding);
        */

    if (roundRect.y1 < t.vp.y1) {
      labelCoord.y = labelCoord.y + t.vp.y1 - roundRect.y1;
      ttCoord.y = labelCoord.y;
      roundRect.move(0, t.vp.y1 - roundRect.y1);
    }

    if (roundRect.y2 > t.vp.y2) {
      labelCoord.y = labelCoord.y - (roundRect.y2 - t.vp.y2);
      ttCoord.y = labelCoord.y;
      roundRect.move(0, -roundRect.y2 + t.vp.y2);
    }

    this.roundRect(
      t.ctx,
      roundRect.x1,
      roundRect.y1,
      roundRect.width,
      roundRect.height,
      cornersRadius
    );

    //labelCoord.x = roundRect.x1+roundRect.width*0.5-labelRect.width*0.5-this.label.offset;

    if (t.toDraw) {
      t.ctx.fill();
      t.ctx.stroke();
      this.label.draw(t.ctx, labelCoord, labelText);
    }

    //console.log(labelCoord, labelText);
    return roundRect;
  }

  drawDeltaAbs(t: tooltipObject) {
    t.ctx.strokeStyle = this._options.lineColor;
    t.ctx.lineWidth = this._options.lineWidth;
    t.ctx.fillStyle = this._options.brushColor;
    t.ctx.setLineDash(this._options.lineDash);

    const labelCoord = new Point(t.coord.x, t.coord.y);

    //параметры начальные
    this.label.position = 'right';

    const lineX = t.coord.x;
    labelCoord.y = labelCoord.y - 25;
    const rectPadding = 6;
    const labelText = 'Δ ' + t.data.y.toFixed(1) + 'pp';
    const cornersRadius = this._options.mainSize;

    let labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);
    let labelStart = new Point(labelRect.x1, labelRect.y1);

    const labelCenter = new Point(labelRect.x1 + labelRect.width * 0.5, labelCoord.y);

    const roundRectWidth = 52;

    let roundRect: Rectangle = new Rectangle(
      labelCenter.x - roundRectWidth * 0.5,
      labelStart.y - rectPadding,
      labelCenter.x + roundRectWidth * 0.5,
      labelStart.y + labelRect.height + rectPadding
    );

    /*
        let roundRect: Rectangle = new Rectangle(labelStart.x - rectPadding,
            labelStart.y - rectPadding,
            labelStart.x - rectPadding + labelRect.width + 2 * rectPadding,
            labelStart.y - rectPadding + labelRect.height + 2 * rectPadding);
        */

    if (roundRect.x2 > t.vp.x2) {
      labelCoord.x = labelCoord.x - roundRect.x2 + t.vp.x2;
      roundRect.move(-roundRect.x2 + t.vp.x2, 0);
    }

    if (roundRect.x1 < lineX) {
      labelCoord.x = lineX;
      this.label.position = 'left';
      labelRect = this.label.getlabelRect(t.ctx, labelCoord, labelText);
      labelStart = new Point(labelRect.x2, labelRect.y1);

      roundRect = new Rectangle(
        labelStart.x - labelRect.width - rectPadding,
        labelStart.y - rectPadding,
        labelStart.x + rectPadding,
        labelStart.y + labelRect.height + rectPadding
      );
    }

    if (roundRect.y1 < t.vp.y1) {
      labelCoord.y = labelCoord.y + t.vp.y1 - roundRect.y1;
      roundRect.move(0, t.vp.y1 - roundRect.y1);
    }

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
  }
}
