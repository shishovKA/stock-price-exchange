import { Point } from '../Point';
import { Rectangle } from '../Rectangle';
import { Tooltip } from '../tooltip/Tooltip';
import { Label } from '../Label';

import { drawBarChart } from './drawings/bar-chart';

interface plotOptions {
  lineWidth: number;
  lineColor: string;
  lineDash: number[];
  brushColor: string;
  mainSize: number;
  fontSize: number;
  char: string;
  lineJoin: CanvasLineJoin;
  opacity: number;
  step: number;
}

interface textLineOptions {
  length: number;
  before: number;
  after: number;
  angle: number;
}

//описание класса

export class Plot {
  _id: string;
  type: string;
  _options: plotOptions;
  tooltips: Tooltip[];
  label: Label;
  labels: Label[] = [];

  textLine: textLineOptions;

  constructor(id: string, type: string, ...options: any) {
    this._id = id;
    this.type = type;

    this._options = {
      lineWidth: 0.5,
      lineColor: '#000000',
      brushColor: '#000000',
      mainSize: 1,
      fontSize: 10,
      char: '1',
      lineDash: [],
      lineJoin: 'miter',
      opacity: 1,
      step: 0,
    };

    this.textLine = {
      length: 15,
      before: 10,
      after: 10,
      angle: 0,
    };

    this.setOptions(options);
    this.tooltips = [];

    this.label = new Label(this.type);
    return this;
  }

  setLineColor(color: string) {
    this._options.lineColor = color;
    return this;
  }

  setLineWidth(width: number) {
    this._options.lineWidth = width;
    return this;
  }

  setBrushColor(color: string) {
    this._options.brushColor = color;
    return this;
  }

  setOptionsPartially(options: Partial<plotOptions>) {
    this._options = { ...this._options, ...options };
    return this;
  }

  // no longer supported: use 'setOptionsPartially' instead
  setOptions(options: any[]) {
    switch (this.type) {
      case 'dotted':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'line':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        if (options[2]) this._options.lineDash = options[2];
        if (options[3]) this._options.lineJoin = options[3];
        break;

      case 'area':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        break;

      case 'bar_chart':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        this._options.mainSize = options[3];
        break;

      case 'area_bottom':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        break;

      case 'area_left':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.brushColor = options[2];
        break;

      case 'unicode':
        this._options.fontSize = options[0];
        this._options.brushColor = options[1];
        this._options.char = options[2];
        break;

      case 'text':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        break;

      case 'side_text':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        break;

      case 'plot_text':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        break;

      case 'text_line':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        break;

      case 'cell_line':
        if (options[0]) this._options.lineWidth = options[0];
        if (options[1]) this._options.lineColor = options[1];
        if (options[2]) this._options.lineDash = options[2];
        if (options[3]) this._options.lineJoin = options[3];
        break;

      case 'cell_area':
        if (options[0]) this._options.lineWidth = options[0];
        if (options[1]) this._options.lineColor = options[1];
        if (options[2]) this._options.brushColor = options[2];
        break;

      case 'line_horizontal':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        if (options[2]) this._options.lineDash = options[2];
        if (options[3]) this._options.lineJoin = options[3];
        break;

      case 'tick_y_end':
        this._options.lineWidth = options[0];
        this._options.lineColor = options[1];
        this._options.mainSize = options[2];
        if (options[3]) this._options.lineDash = options[3];
        if (options[4]) this._options.lineJoin = options[4];
        break;
    }
  }

  setLineWidthMediaQueries(valueList: number[], queryList: string[]) {
    queryList.forEach((q, ind) => {
      const mediaQuery = window.matchMedia(q);
      mediaQuery.addEventListener('change', () => {
        if (mediaQuery.matches) {
          this._options.lineWidth = valueList[ind];
        }
      });

      if (mediaQuery.matches) this._options.lineWidth = valueList[ind]; // call once for each query
    });

    return this;
  }

  get id(): string {
    return this._id;
  }

  setOpacity(opacity: number) {
    this._options.opacity = opacity;
    return this;
  }

  drawPlot(
    isAnimationOn: boolean,
    ctx: CanvasRenderingContext2D,
    plotData: Point[],
    vp: Rectangle,
    labels: string[],
    highlighted?: boolean
  ) {
    ctx.strokeStyle = this._options.lineColor;
    ctx.lineWidth = this._options.lineWidth;
    ctx.globalAlpha = 1;
    ctx.fillStyle = this._options.brushColor;
    ctx.lineJoin = this._options.lineJoin;

    let stepWidth = vp.width;
    if (plotData.length >= 2) {
      stepWidth = plotData[1].x - plotData[0].x;
    }
    this._options.step = stepWidth;

    switch (this.type) {
      case 'dotted':
        this.drawDotted(ctx, plotData);
        break;

      case 'line':
        this.drawLine(ctx, plotData);
        break;

      case 'area':
        this.drawArea(ctx, plotData, vp);
        break;

      case 'bar_chart':
        drawBarChart.call(this, ctx, plotData, vp);
        break;

      case 'area_bottom':
        this.drawArea(ctx, plotData, vp);
        break;

      case 'area_left':
        this.drawArea(ctx, plotData, vp);
        break;

      case 'unicode':
        this.drawUnicode(ctx, plotData, highlighted);
        break;

      case 'text':
        this.drawText(isAnimationOn, ctx, plotData, labels);
        break;

      case 'side_text':
        this.sideText(isAnimationOn, ctx, plotData, vp, labels);
        break;

      case 'plot_text':
        this.plotText(isAnimationOn, ctx, plotData, vp, labels);
        break;

      case 'text_line':
        this.drawTextLine(isAnimationOn, ctx, plotData, labels);
        break;

      case 'cell_line':
        this.draw_cell_line(ctx, plotData);
        break;

      case 'cell_area':
        this.draw_cell_area(ctx, plotData);
        break;

      case 'line_horizontal':
        this.line('horizontal', ctx, plotData, vp);
        break;

      case 'tick_y_end':
        this.yTick('end', ctx, plotData, vp);
        break;
    }
  }

  yTick(position: string, ctx: CanvasRenderingContext2D, plotData: Point[], vp: Rectangle) {
    ctx.setLineDash(this._options.lineDash);
    for (let i = 0; i < plotData.length; i++) {
      const start = new Point(0, plotData[i].y);
      const end = new Point(0, plotData[i].y);

      switch (position) {
        case 'end':
          start.x = vp.x2;
          break;
        case 'start':
          start.x = vp.x1;
          break;
      }
      end.x = start.x + this._options.mainSize;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  line(oritation: string, ctx: CanvasRenderingContext2D, plotData: Point[], vp: Rectangle) {
    ctx.setLineDash(this._options.lineDash);
    for (let i = 0; i < plotData.length; i++) {
      ctx.beginPath();
      switch (oritation) {
        case 'horizontal':
          ctx.moveTo(vp.x1, plotData[i].y);
          ctx.lineTo(vp.x2, plotData[i].y);
          break;
        case 'vertical':
          ctx.moveTo(plotData[i].x, vp.y1);
          ctx.lineTo(plotData[i].x, vp.y2);
          break;
      }
      ctx.stroke();
    }
  }

  draw_cell_line(ctx: CanvasRenderingContext2D, plotData: Point[]) {
    let cellWidth = 0;
    if (plotData.length > 1) cellWidth = Math.abs(plotData[1].x - plotData[0].x);

    ctx.setLineDash(this._options.lineDash);

    for (let i = 0; i < plotData.length; i++) {
      ctx.beginPath();
      ctx.moveTo(plotData[i].x, plotData[i].y);
      ctx.lineTo(plotData[i].x + cellWidth, plotData[i].y);
      ctx.stroke();
    }
  }

  draw_cell_area(ctx: CanvasRenderingContext2D, plotData: Point[]) {
    let cellWidth = 0;
    const halfLenght = Math.round(plotData.length / 2);

    if (plotData.length > 1) cellWidth = Math.abs(plotData[1].x - plotData[0].x);

    ctx.setLineDash(this._options.lineDash);

    for (let i = 0; i < halfLenght; i++) {
      ctx.beginPath();
      ctx.moveTo(plotData[i].x, plotData[i].y);
      ctx.lineTo(plotData[i].x + cellWidth, plotData[i].y);
      ctx.lineTo(
        plotData[plotData.length - 1 - i].x + cellWidth,
        plotData[plotData.length - 1 - i].y
      );
      ctx.lineTo(plotData[plotData.length - 1 - i].x, plotData[plotData.length - 1 - i].y);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawDotted(ctx: CanvasRenderingContext2D, plotData: Point[]) {
    ctx.setLineDash(this._options.lineDash);
    for (let i = 0; i < plotData.length; i++) {
      ctx.beginPath();
      ctx.arc(plotData[i].x, plotData[i].y, this._options.mainSize, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  drawUnicode(ctx: CanvasRenderingContext2D, plotData: Point[], highlighted?: boolean) {
    ctx.font = `${this._options.fontSize}px serif`;
    ctx.textBaseline = 'middle';

    const text = ctx.measureText(this._options.char);
    for (let i = 0; i < plotData.length; i++) {
      ctx.globalAlpha = 1;
      ctx.fillText(this._options.char, plotData[i].x - text.width * 0.5, plotData[i].y);
      if (highlighted) {
        ctx.lineWidth = 7;
        ctx.globalAlpha = 0.3;
        ctx.strokeText(this._options.char, plotData[i].x - text.width * 0.5, plotData[i].y);
        ctx.globalAlpha = 1;
        ctx.fillText(this._options.char, plotData[i].x - text.width * 0.5, plotData[i].y);
      }
    }
  }

  drawTextLine(
    isAnimationOn: boolean,
    ctx: CanvasRenderingContext2D,
    plotData: Point[],
    labels: string[]
  ) {
    const textPointArr = plotData.map((el) => {
      const textPoint = new Point(el.x, el.y);
      return textPoint;
    });

    for (let i = 0; i < plotData.length; i++) {
      let printTextArr = [''];
      if (labels[i] !== undefined) printTextArr = labels[i].split('\\n');

      printTextArr.forEach((row, ind, mas) => {
        const t = new Point(textPointArr[i].x, textPointArr[i].y);
        t.y = t.y - (mas.length - ind - 1) * this.label.getRowHeight(ctx);
        this.label.draw(ctx, t, row);
      });
    }
  }

  drawText(
    isAnimationOn: boolean,
    ctx: CanvasRenderingContext2D,
    plotData: Point[],
    labels: string[]
  ) {
    const getLabelArrRect = (textArr: string[], t: Point) => {
      let x1 = t.x,
        x2 = t.x,
        y1 = t.y,
        y2 = t.y;
      textArr.forEach((row, i, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - i - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);
        if (textRect.x1 < x1) x1 = textRect.x1;
        if (textRect.x2 > x2) x2 = textRect.x2;
        if (textRect.y1 < y1) y1 = textRect.y1;
        if (textRect.y2 > y2) y2 = textRect.y2;
      });
      return new Rectangle(x1, y1, x2, y2);
    };

    const pushBorder = (textArr: string[], t: Point, cW: number, cH: number) => {
      let dx = 0;
      let dy = 0;

      textArr.forEach((row, ind, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - ind - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);

        if (textRect.x1 < 0 && textRect.x1 < dx) dx = textRect.x1;
        if (textRect.x2 > cW && cW - textRect.x2 > dx) dx = cW - textRect.x2;

        if (textRect.y1 < 0 && textRect.y1 < dy) dy = textRect.y1;
        if (textRect.y2 > cH && cH - textRect.y2 > dy) dy = cH - textRect.y2;
      });

      if (dx !== 0) dx = ((Math.abs(dx) + 5) * dx) / Math.abs(dx);
      if (dy !== 0) dy = ((Math.abs(dy) + 5) * dy) / Math.abs(dy);

      t.x = t.x - dx;
      t.y = t.y - dy;
    };

    const cursorLineLength = this.textLine.length;
    const before_cursorLine = this.textLine.before;
    const after_cursorLine = this.textLine.after;
    const rotation_angle = this.textLine.angle;

    let cursorLineStart;
    let cursorLineEnd;
    let rotationCenter: Point;

    const canvasW = ctx.canvas.clientWidth;
    const canvasH = ctx.canvas.clientHeight;

    //plotData.sort((a, b) => a.x - b.x);

    const textPointArr = plotData.map((el) => {
      rotationCenter = new Point(el.x, el.y);
      const textPoint = new Point(
        el.x,
        el.y - before_cursorLine - cursorLineLength - after_cursorLine
      ).rotate(rotation_angle, rotationCenter);
      return textPoint;
    });

    if (!isAnimationOn) {
      // x overlap
      let hasOverlap = true;
      const counter = 0;

      while (hasOverlap && counter < textPointArr.length * 2) {
        hasOverlap = false;

        for (let i = 0; i < textPointArr.length - 1; i++) {
          let printTextArr = [''];
          if (labels[i] !== undefined) printTextArr = labels[i].split('\\n');
          let printTextArr1 = [''];
          if (labels[i + 1] !== undefined) printTextArr1 = labels[i + 1].split('\\n');

          const rect1 = getLabelArrRect(printTextArr, textPointArr[i]);
          const rect2 = getLabelArrRect(printTextArr1, textPointArr[i + 1]);

          if (rect1.isIntersect(rect2)) {
            hasOverlap = true;
            const abs = rect1.splitX(rect2);
            textPointArr[i].x = textPointArr[i].x - abs * 0.5 - 2;
            textPointArr[i + 1].x = textPointArr[i + 1].x + abs * 0.5 + 2;
          }
        }
      }
    }

    for (let i = 0; i < plotData.length; i++) {
      rotationCenter = new Point(plotData[i].x, plotData[i].y);

      // draw line
      ctx.beginPath();
      ctx.setLineDash([]);

      cursorLineStart = new Point(plotData[i].x, plotData[i].y - before_cursorLine).rotate(
        rotation_angle,
        rotationCenter
      );
      cursorLineEnd = new Point(
        plotData[i].x,
        plotData[i].y - before_cursorLine - cursorLineLength
      ).rotate(rotation_angle, rotationCenter);

      ctx.strokeStyle = this._options.lineColor;
      ctx.lineWidth = this._options.lineWidth;
      ctx.globalAlpha = 1;
      ctx.fillStyle = this._options.brushColor;
      ctx.lineJoin = this._options.lineJoin;
      ctx.globalAlpha = 1;
      ctx.moveTo(cursorLineStart.x, cursorLineStart.y);
      ctx.lineTo(cursorLineEnd.x, cursorLineEnd.y);
      ctx.stroke();
      ctx.closePath;

      let printTextArr = [''];
      if (labels[i] !== undefined) printTextArr = labels[i].split('\\n');

      pushBorder(printTextArr, textPointArr[i], canvasW, canvasH);

      printTextArr.forEach((row, ind, mas) => {
        const t = new Point(textPointArr[i].x, textPointArr[i].y);
        t.y = t.y - (mas.length - ind - 1) * this.label.getRowHeight(ctx);
        this.label.draw(ctx, t, row);
      });
    }
  }

  sideText(
    isAnimationOn: boolean,
    ctx: CanvasRenderingContext2D,
    plotData: Point[],
    vp: Rectangle,
    labels: string[]
  ) {
    const getLabelArrRect = (textArr: string[], t: Point) => {
      let x1 = t.x,
        x2 = t.x,
        y1 = t.y,
        y2 = t.y;
      textArr.forEach((row, i, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - i - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);
        if (textRect.x1 < x1) x1 = textRect.x1;
        if (textRect.x2 > x2) x2 = textRect.x2;
        if (textRect.y1 < y1) y1 = textRect.y1;
        if (textRect.y2 > y2) y2 = textRect.y2;
      });
      return new Rectangle(x1, y1, x2, y2);
    };

    const pushBorder = (textArr: string[], t: Point, cW: number, cH: number) => {
      let dx = 0;
      let dy = 0;

      textArr.forEach((row, ind, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - ind - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);

        if (textRect.x1 < 0 && textRect.x1 < dx) dx = textRect.x1;
        if (textRect.x2 > cW && cW - textRect.x2 > dx) dx = cW - textRect.x2;

        if (textRect.y1 < 0 && textRect.y1 < dy) dy = textRect.y1;
        if (textRect.y2 > cH && cH - textRect.y2 > dy) dy = cH - textRect.y2;
      });

      if (dx !== 0) dx = ((Math.abs(dx) + 5) * dx) / Math.abs(dx);
      if (dy !== 0) dy = ((Math.abs(dy) + 5) * dy) / Math.abs(dy);

      t.x = t.x - dx;
      t.y = t.y - dy;
    };

    const canvasW = ctx.canvas.clientWidth;
    const canvasH = ctx.canvas.clientHeight;

    //plotData.sort((a, b) => a.x - b.x);

    const textPointArr = plotData.map((el) => {
      el.x = vp.x2;
      return el;
    });

    if (!isAnimationOn) {
      // x overlap
      let hasOverlap = true;
      const counter = 0;

      while (hasOverlap && counter < textPointArr.length * 2) {
        hasOverlap = false;

        for (let i = 0; i < textPointArr.length - 1; i++) {
          for (let j = i + 1; j < textPointArr.length; j++) {
            let printTextArr = [''];
            if (labels[i] !== undefined) printTextArr = labels[i].split('\n');
            let printTextArr1 = [''];
            if (labels[j] !== undefined) printTextArr1 = labels[j].split('\n');

            const rect1 = getLabelArrRect([printTextArr[0]], textPointArr[i]);
            const rect2 = getLabelArrRect([printTextArr1[0]], textPointArr[j]);

            if (rect1.isIntersect(rect2)) {
              hasOverlap = true;
              const abs = rect1.splitY(rect2);
              textPointArr[i].y = textPointArr[i].y - abs * 0.5 - 2;
              textPointArr[j].y = textPointArr[j].y + abs * 0.5 + 2;
            }
          }
        }
      }
    }

    for (let i = 0; i < plotData.length; i++) {
      // draw line
      ctx.beginPath();
      ctx.setLineDash([]);

      ctx.strokeStyle = this._options.lineColor;
      ctx.lineWidth = this._options.lineWidth;
      ctx.globalAlpha = 1;
      ctx.fillStyle = this._options.brushColor;
      ctx.lineJoin = this._options.lineJoin;
      ctx.globalAlpha = 1;

      ctx.stroke();
      ctx.closePath;

      let printTextArr = [''];
      if (labels[i] !== undefined) printTextArr = labels[i].split('\n');

      pushBorder(printTextArr, textPointArr[i], canvasW, canvasH);

      // print only 1-st line
      printTextArr.forEach((row, ind, mas) => {
        const t = new Point(textPointArr[i].x, textPointArr[i].y);
        t.y = t.y + ind * this.label.getRowHeight(ctx);
        if (ind === 0) {
          this.label.draw(ctx, t, row);
        }
      });

      // print only 2-nd line
      printTextArr.forEach((row, ind, mas) => {
        if (ind === 1) {
          const t = new Point(textPointArr[i].x, textPointArr[i].y);
          t.y = t.y + ind * this.label.getRowHeight(ctx);
          let hasOverlap = false;

          for (let j = 0; j < textPointArr.length; j++) {
            const secondRow = [row];
            const firstRow = labels[j].split('\n');

            const rect1 = getLabelArrRect(secondRow, t);
            const rect2 = getLabelArrRect([firstRow[0]], textPointArr[j]);

            if (rect1.isIntersect(rect2) && i !== j) {
              hasOverlap = true;
            }
          }

          if (hasOverlap) {
            t.x = t.x + ctx.measureText(mas[0]).width + 5;
            t.y = textPointArr[i].y;
            t.y = t.y + this.label.getRowHeight(ctx) - this.labels[ind - 1].getRowHeight(ctx);
            this.labels[ind - 1].draw(ctx, t, row);
          } else {
            t.y = t.y + this.label.getRowHeight(ctx) - this.labels[ind - 1].getRowHeight(ctx);
            this.labels[ind - 1].draw(ctx, t, row);
          }
        }
      });
    }
  }

  plotText(
    isAnimationOn: boolean,
    ctx: CanvasRenderingContext2D,
    plotData: Point[],
    vp: Rectangle,
    labels: string[]
  ) {
    const getLabelArrRect = (textArr: string[], t: Point) => {
      let x1 = t.x,
        x2 = t.x,
        y1 = t.y,
        y2 = t.y;
      textArr.forEach((row, i, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - i - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);
        if (textRect.x1 < x1) x1 = textRect.x1;
        if (textRect.x2 > x2) x2 = textRect.x2;
        if (textRect.y1 < y1) y1 = textRect.y1;
        if (textRect.y2 > y2) y2 = textRect.y2;
      });
      return new Rectangle(x1, y1, x2, y2);
    };

    const pushBorder = (textArr: string[], t: Point, cW: number, cH: number) => {
      let dx = 0;
      let dy = 0;

      textArr.forEach((row, ind, mas) => {
        const t_p = new Point(t.x, t.y);
        t_p.y = t_p.y - (mas.length - ind - 1) * this.label.getRowHeight(ctx);
        const textRect = this.label.getlabelRect(ctx, t_p, row);

        if (textRect.x1 < 0 && textRect.x1 < dx) dx = textRect.x1;
        if (textRect.x2 > cW && cW - textRect.x2 > dx) dx = cW - textRect.x2;

        if (textRect.y1 < 0 && textRect.y1 < dy) dy = textRect.y1;
        if (textRect.y2 > cH && cH - textRect.y2 > dy) dy = cH - textRect.y2;
      });

      if (dx !== 0) dx = ((Math.abs(dx) + 5) * dx) / Math.abs(dx);
      if (dy !== 0) dy = ((Math.abs(dy) + 5) * dy) / Math.abs(dy);

      t.x = t.x - dx;
      t.y = t.y - dy;
    };

    const canvasW = ctx.canvas.clientWidth;
    const canvasH = ctx.canvas.clientHeight;

    //plotData.sort((a, b) => a.x - b.x);

    const textPointArr = plotData.map((el) => {
      return el;
    });

    if (!isAnimationOn) {
      // x overlap
      let hasOverlap = true;
      const counter = 0;

      while (hasOverlap && counter < textPointArr.length * 2) {
        hasOverlap = false;

        for (let i = 0; i < textPointArr.length - 1; i++) {
          for (let j = i + 1; j < textPointArr.length; j++) {
            let printTextArr = [''];
            if (labels[i] !== undefined) printTextArr = labels[i].split('\n');
            let printTextArr1 = [''];
            if (labels[j] !== undefined) printTextArr1 = labels[j].split('\n');

            const rect1 = getLabelArrRect([printTextArr[0]], textPointArr[i]);
            const rect2 = getLabelArrRect([printTextArr1[0]], textPointArr[j]);

            if (rect1.isIntersect(rect2)) {
              hasOverlap = true;
              const abs = rect1.splitY(rect2);
              textPointArr[i].y = textPointArr[i].y - abs * 0.5 - 2;
              textPointArr[j].y = textPointArr[j].y + abs * 0.5 + 2;
            }
          }
        }
      }
    }

    for (let i = 0; i < plotData.length; i++) {
      // draw line
      ctx.beginPath();
      ctx.setLineDash([]);

      ctx.strokeStyle = this._options.lineColor;
      ctx.lineWidth = this._options.lineWidth;
      ctx.globalAlpha = 1;
      ctx.fillStyle = this._options.brushColor;
      ctx.lineJoin = this._options.lineJoin;
      ctx.globalAlpha = 1;

      ctx.stroke();
      ctx.closePath;

      let printTextArr = [''];
      if (labels[i] !== undefined) printTextArr = labels[i].split('\n');

      pushBorder(printTextArr, textPointArr[i], canvasW, canvasH);

      // print only 1-st line
      printTextArr.forEach((row, ind, mas) => {
        const t = new Point(textPointArr[i].x, textPointArr[i].y);
        t.y = t.y + ind * this.label.getRowHeight(ctx);
        if (ind === 0) {
          this.label.draw(ctx, t, row);
        }
      });

      // print only 2-nd line
      printTextArr.forEach((row, ind, mas) => {
        if (ind === 1) {
          const t = new Point(textPointArr[i].x, textPointArr[i].y);
          t.y = t.y + ind * this.label.getRowHeight(ctx);
          let hasOverlap = false;

          for (let j = 0; j < textPointArr.length; j++) {
            const secondRow = [row];
            const firstRow = labels[j].split('\n');

            const rect1 = getLabelArrRect(secondRow, t);
            const rect2 = getLabelArrRect([firstRow[0]], textPointArr[j]);

            if (rect1.isIntersect(rect2) && i !== j) {
              hasOverlap = true;
            }
          }

          if (hasOverlap) {
            t.x = t.x + ctx.measureText(mas[0]).width + 5;
            t.y = textPointArr[i].y;
            t.y = t.y + this.label.getRowHeight(ctx) - this.labels[ind - 1].getRowHeight(ctx);
            this.labels[ind - 1].draw(ctx, t, row);
          } else {
            t.y = t.y + this.label.getRowHeight(ctx) - this.labels[ind - 1].getRowHeight(ctx);
            this.labels[ind - 1].draw(ctx, t, row);
          }
        }
      });
    }
  }

  /*
    drawText360(ctx: CanvasRenderingContext2D, plotData: Point[], labels: string[]) {

        let cursorLineLength = this.textLine.length;
        let before_cursorLine = this.textLine.before;
        let after_cursorLine = this.textLine.after;
        let rotation_angle = this.textLine.angle;

        let cursorLineStart;
        let cursorLineEnd;
        let rotationCenter: Point;
        let textPoint;

        const canvasW = ctx.canvas.clientWidth;
        const canvasH = ctx.canvas.clientHeight;

        //console.log(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        

        for (let i = 0; i < plotData.length; i++) {

            ctx.strokeStyle = this._options.lineColor;
            ctx.lineWidth = this._options.lineWidth;
            ctx.globalAlpha = 1;
            ctx.fillStyle = this._options.brushColor;
            ctx.lineJoin = this._options.lineJoin;

            rotationCenter = new Point(plotData[i].x, plotData[i].y);

            let printText = labels[i]
            if (!printText) printText = '';
            let printTextArr = printText.split('\\n');

            let curAngle = rotation_angle;
            
            
            for (let k = rotation_angle; k < rotation_angle+360; k++) {
                
                curAngle = k;
                let isFit: boolean = true;
                
                printTextArr.forEach((row, ind, mas)=> {
                    textPoint = new Point(plotData[i].x, plotData[i].y - before_cursorLine - cursorLineLength - after_cursorLine)
                        .rotate(curAngle, rotationCenter);
                    textPoint.y = textPoint.y - (mas.length - ind - 1)*this.label.getRowHeight(ctx);
                    let textRect = this.label.getlabelRect(ctx, textPoint, row);
                    
                    if (
                        (textRect.x1 < 0) || (textRect.x2 < 0) || (textRect.y1 < 0) || (textRect.y2 < 0) ||
                        (textRect.x2 > canvasW) || (textRect.y2 > canvasH)
                        ) 
                    
                        isFit = false;
                });

                if (isFit) break;

            }

            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.setLineDash([]);

            cursorLineStart = new Point(plotData[i].x, plotData[i].y - before_cursorLine)
                .rotate(curAngle, rotationCenter);
            cursorLineEnd = new Point(plotData[i].x, plotData[i].y - before_cursorLine - cursorLineLength)
                .rotate(curAngle, rotationCenter);

            ctx.moveTo(cursorLineStart.x, cursorLineStart.y);
            ctx.lineTo(cursorLineEnd.x, cursorLineEnd.y);
            ctx.stroke();
            
            printTextArr.forEach((row, ind, mas)=> {
                textPoint = new Point(plotData[i].x, plotData[i].y - before_cursorLine - cursorLineLength - after_cursorLine)
                    .rotate(curAngle, rotationCenter);
                textPoint.y = textPoint.y - (mas.length - ind - 1)*this.label.getRowHeight(ctx);
                //console.log(this.label.getlabelRect(ctx, textPoint, row));
                this.label.draw(ctx, textPoint, row);
            });
            
        }

    }


    */

  drawLine(ctx: CanvasRenderingContext2D, plotData: Point[]) {
    ctx.lineCap = 'round';

    ctx.setLineDash(this._options.lineDash);
    ctx.beginPath();
    ctx.moveTo(plotData[0].x, plotData[0].y);

    for (let i = 1; i < plotData.length; i++) {
      ctx.lineTo(plotData[i].x, plotData[i].y);
    }

    ctx.stroke();
  }

  drawArea(ctx: CanvasRenderingContext2D, plotData: Point[], vp: Rectangle) {
    ctx.beginPath();

    switch (this.type) {
      case 'area_bottom':
        ctx.lineTo(vp.x1, vp.zeroY);
        break;
      case 'area_left':
        ctx.lineTo(vp.zeroX, plotData[0].y);
        break;
    }

    ctx.lineTo(plotData[0].x, plotData[0].y);

    for (let i = 1; i < plotData.length; i++) {
      ctx.lineTo(plotData[i].x, plotData[i].y);
    }

    switch (this.type) {
      case 'area_bottom':
        ctx.lineTo(vp.x2, vp.zeroY);
        break;
      case 'area_left':
        ctx.lineTo(vp.zeroX, plotData[plotData.length - 1].y);
        break;
    }

    ctx.closePath();

    ctx.globalAlpha = this._options.opacity;

    // ctx.stroke();
    ctx.fill();
  }

  addTooltip(id: string, type: string, ...options: any): Tooltip {
    const tooltip = new Tooltip(id, type, ...options);
    this.tooltips.push(tooltip);
    return tooltip;
  }

  findTooltipById(id: string): Tooltip | null {
    const tooltips: Tooltip[] = this.tooltips.filter((tooltip) => {
      return tooltip.id === id;
    });
    if (tooltips.length !== 0) return tooltips[0];
    return null;
  }

  setTextLineOptions(before: number, length: number, after: number, angle: number) {
    this.textLine.before = before;
    this.textLine.length = length;
    this.textLine.after = after;
    this.textLine.angle = angle;
    return this;
  }
}
