/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Canvas } from "./Canvas";
import { Data } from "./Data";
import { Plot } from "./plot/Plot";
import { Axis } from "./Axis";
import { Transformer } from "./Transformer";
import { Rectangle } from "./Rectangle";
import { Point } from "./Point";
import { Series } from "./Series";
import { BackGround } from "./BackGround";
import { Signal } from "signals";
import { SeriesBase } from "./series/SeriesBase";
import { SeriesXY } from "./series/SeriesXY";

// interfaces
import { tooltipObject } from "./tooltip/Tooltip";

export class Chart {
  container: HTMLElement;
  canvasTT: Canvas;
  data: Data;
  plots: Plot[];
  xAxis: Axis;
  yAxis: Axis;
  hasBorder = false;
  clipSeriesCanvas = false;
  background?: BackGround;

  tooltipsDataIndexUpdated: Signal;

  constructor(container: HTMLElement, xMinMax: number[], yMinMax: number[]) {
    //signals
    this.tooltipsDataIndexUpdated = new Signal();
    this.container = container;
    this.canvasTT = new Canvas(container);
    this.canvasTT.turnOnListenres();
    this.canvasTT.canvas.style.zIndex = "4";

    this.data = new Data();
    this.plots = [];

    this.xAxis = new Axis(xMinMax, "horizontal", container);
    this.yAxis = new Axis(yMinMax, "vertical", container);

    //bind
    this.tooltipsDraw = this.tooltipsDraw.bind(this);
    this.seriesReDraw = this.seriesReDraw.bind(this);
    this.seriesReDraw_Static = this.seriesReDraw_Static.bind(this);

    //call methods
    this.bindChildSignals();
    //this.tooltipsDraw(true);
  }

  refresh() {
    this.xAxis.refresh();
    this.yAxis.refresh();
    this.tooltipsDraw(undefined, true);
  }

  switchResolution() {
    this.xAxis.canvas.squareRes = true;
    this.yAxis.canvas.squareRes = true;
    this.canvasTT.squareRes = true;

    if (this.background) this.background.canvas.squareRes = true;

    this.data.seriesStorage.forEach((series, ind) => {
      series.canvas.squareRes = true;
    });
  }

  bindChildSignals() {
    this.xAxis.onRefreshed.add(() => {
      this.seriesUpdatePlotData();
      //this.tooltipsDraw(true);
    });

    this.yAxis.onRefreshed.add(() => {
      this.seriesUpdatePlotData();
      //this.tooltipsDraw(true);
    });

    //min max
    this.xAxis.onMinMaxSetted.add((hasPlotAnimation) => {
      // @ts-ignore
      if (hasPlotAnimation) this.seriesUpdatePlotData();
      this.tooltipsDraw(undefined, true);
    });

    //min max
    this.yAxis.onMinMaxSetted.add((hasPlotAnimation) => {
      if (hasPlotAnimation) this.seriesUpdatePlotData();
      this.tooltipsDraw(undefined, true);
    });
    // canvas

    this.canvasTT.mouseMoved.add(this.tooltipsDraw);
    this.canvasTT.mouseOuted.add(() => {
      this.tooltipsDraw(undefined, true);
    });
    this.canvasTT.touchEnded.add(() => {
      this.tooltipsDraw(undefined, true);
    });
  }

  bindOtherChartTooltips(otherChart: Chart) {
    this.canvasTT.mouseOuted.add(() => {
      const coords = this.canvasTT.mouseCoords;
      otherChart.tooltipsDraw(coords, true);
    });
    this.canvasTT.mouseMoved.add(() => {
      const coords = this.canvasTT.mouseCoords;
      otherChart.tooltipsDraw(coords);
    });
  }

  get axisRect(): Rectangle {
    return new Rectangle(
      this.xAxis.min,
      this.yAxis.min,
      this.xAxis.max,
      this.yAxis.max
    );
  }

  // генерируем PlotData у series
  seriesUpdatePlotData() {
    this.data.seriesStorage.forEach((series, ind) => {
      series.updatePlotData(this.axisRect, series.canvas.viewport);
    });
  }

  // отрисовка одной серии
  seriesReDraw(series: Series) {
    const canvas = series.canvas;
    canvas.clear();
    if (this.clipSeriesCanvas) canvas.clipCanvas();

    series.plots.forEach((plotId) => {
      const plot: Plot | null = this.findPlotById(plotId);
      if (plot) {
        // @ts-ignore
        plot.drawPlot(
          true,
          // @ts-ignore
          canvas.ctx,
          // @ts-ignore
          series.plotDataArr,
          canvas.viewport,
          // @ts-ignore
          series.plotLabels
        );
      }
    });
    //this.tooltipsDraw(true);
  }

  seriesReDraw_Static(series: Series) {
    const canvas = series.canvas;
    canvas.clear();
    if (this.clipSeriesCanvas) canvas.clipCanvas();

    series.plots.forEach((plotId) => {
      const plot: Plot | null = this.findPlotById(plotId);
      if (plot) {
        // @ts-ignore
        plot.drawPlot(
          false,
          // @ts-ignore
          canvas.ctx,
          // @ts-ignore
          series.plotDataArr,
          canvas.viewport,
          // @ts-ignore
          series.plotLabels
        );
      }
    });
    //this.tooltipsDraw(true);
  }

  setCanvasPaddings(...paddings: number[]) {
    this.canvasTT.setPaddings(...paddings);
    this.xAxis.canvas.setPaddings(...paddings);
    this.yAxis.canvas.setPaddings(...paddings);

    if (this.background) this.background.canvas.setPaddings(...paddings);

    this.data.seriesStorage.forEach((series, ind) => {
      series.canvas.setPaddings(...paddings);
    });
  }

  addBackGround(type: string) {
    this.background = new BackGround(type, this.container);
    //ticks
    this.xAxis.ticks.onCoordsChanged.add(() => {
      this.backgroundDraw();
    });

    this.yAxis.ticks.onCoordsChanged.add(() => {
      this.backgroundDraw();
    });

    this.background.canvas.resized.add(() => {
      this.backgroundDraw();
    });

    this.backgroundDraw();
  }

  backgroundDraw() {
    if (this.background)
      this.background.draw(this.xAxis.ticks.coords, this.yAxis.ticks.coords);
  }

  addPlot(id: string, type: string, ...options: any) {
    const plot = new Plot(id, type, ...options);
    this.plots.push(plot);
    return plot;
  }

  findPlotById(id: string): Plot | null {
    const plots: Plot[] = this.plots.filter((plot) => {
      return plot.id === id;
    });
    if (plots.length !== 0) return plots[0];
    return null;
  }

  addSeries(id: string, seriesData: number[][], labels?: string[]) {
    const newSeries: Series = new SeriesXY(
      id,
      this.container,
      seriesData,
      labels
    );

    newSeries.canvas.setPaddings(
      this.canvasTT.top,
      this.canvasTT.right,
      this.canvasTT.bottom,
      this.canvasTT.left
    );
    //newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);
    newSeries.onPlotDataChanged.add(this.seriesReDraw);
    newSeries.onPlotDataChanged_Static.add(this.seriesReDraw_Static);
    newSeries.onSeriesDataChanged.add((series) => {
      series.updatePlotData(this.axisRect, series.canvas.viewport);
    });
    newSeries.canvas.resized.add(() => {
      newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);
    });

    newSeries.canvas.onPaddingsSetted.add(() => {
      //newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);
    });

    this.data.seriesStorage.push(newSeries);

    return newSeries;
  }

  addSeriesRow(id: string, seriesData: number[][]) {
    const newSeries: Series = new SeriesBase(id, this.container, seriesData);
    newSeries.canvas.setPaddings(
      this.canvasTT.top,
      this.canvasTT.right,
      this.canvasTT.bottom,
      this.canvasTT.left
    );

    //newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);

    newSeries.onPlotDataChanged.add(this.seriesReDraw);
    newSeries.onPlotDataChanged_Static.add(this.seriesReDraw_Static);

    newSeries.onSeriesDataChanged.add((series) => {
      series.updatePlotData(this.axisRect, series.canvas.viewport);
    });
    newSeries.canvas.resized.add(() => {
      newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);
    });

    newSeries.canvas.onPaddingsSetted.add(() => {
      //newSeries.updatePlotData(this.axisRect, newSeries.canvas.viewport, true);
    });

    this.data.seriesStorage.push(newSeries);

    return newSeries;
  }

  switchDataAnimation(hasAnimation: boolean, duration?: number) {
    this.data.seriesStorage.forEach((series, ind) => {
      series.hasAnimation = hasAnimation;
      if (duration) series.animationDuration = duration;
    });
  }

  // отрисовываем тултипы
  tooltipsDraw(coords?: Point, drawLast?: boolean) {
    let mouseXY: Point;
    mouseXY = this.canvasTT.mouseCoords;
    if (coords) mouseXY = coords;

    const transformer = new Transformer();

    const delta_abs_buf: Point[] = [];
    const delta_abs_buf_coord: Point[] = [];
    const data_y_end_buf: any[][] = [];

    const seriesX =
      this.xAxis.min +
      (mouseXY.x * this.xAxis.length) / this.canvasTT.viewport.width;
    const seriesY =
      this.yAxis.max -
      (mouseXY.y * this.yAxis.length) / this.canvasTT.viewport.height;
    const sriesP = new Point(seriesX, seriesY);

    const tt: tooltipObject = {
      // @ts-ignore
      ctx: this.canvasTT.ctx,
      vp: this.canvasTT.viewport,
      toDraw: true,
      coord: new Point(0, 0),
      data: new Point(0, 0),
      ind: 0,
      step: 0,
    };

    // clear canvas
    this.canvasTT.clear();

    this.data.seriesStorage.forEach((series) => {
      const [pointData, tt_ind] = series.getClosestDataPointX(sriesP);
      const [pointDataXY, tt_ind_XY] = series.getClosestDataPointXY(sriesP);
      const tooltipCoordX = series.getClosestPlotPointX(
        new Point(mouseXY.x + this.canvasTT.left, mouseXY.y + this.canvasTT.top)
      );
      const tooltipCoordXY = series.getClosestPlotPointXY(
        new Point(mouseXY.x + this.canvasTT.left, mouseXY.y + this.canvasTT.top)
      );

      tt.ind = tt_ind;

      series.plots.forEach((plotId) => {
        const plot: Plot | null = this.findPlotById(plotId);
        if (plot) {
          plot.tooltips.forEach((tooltip) => {
            this.tooltipsDataIndexUpdated.dispatch(pointData.x);

            if (drawLast) {
              switch (tooltip.type) {
                case "data_y_end":
                  data_y_end_buf.push([tooltip, tooltipCoordX, pointData]);
                  break;

                case "circle_series":
                  tt.coord = new Point(tooltipCoordX.x, tooltipCoordX.y);
                  tt.data = pointData;
                  tooltip.drawTooltip(tt);
                  break;
              }
            } else {
              switch (tooltip.type) {
                /*

                                case 'label_x_start':
                                    if (!tooltipCoordX) tooltipCoordX = series.getClosestPlotPointX(new Point(mouseXY.x+this.canvasTT.left, mouseXY.y+this.canvasTT.top));
                                    // @ts-ignore
                                    tooltip.drawTooltip(this.canvasTT.ctx, this.canvasTT.viewport, new Point(tooltipCoordX.x, tooltipCoordX.y), pointData, tt_ind);
                                    break;

                                case 'line_vertical_full':
                                    if (!tooltipCoordX) tooltipCoordX = series.getClosestPlotPointX(new Point(mouseXY.x+this.canvasTT.left, mouseXY.y+this.canvasTT.top));
                                    // @ts-ignore
                                    tooltip.drawTooltip(this.canvasTT.ctx, this.canvasTT.viewport, new Point(tooltipCoordX.x, tooltipCoordX.y), pointData);
                                    break;
                                
                                case 'text_line_loss':
                                    const [pointDataX, tt_ind_X] = series.getClosestDataPointX(sriesP);
                                    if (!tooltipCoordX) tooltipCoordX = series.getClosestPlotPointX(new Point(mouseXY.x+this.canvasTT.left, mouseXY.y+this.canvasTT.top));
                                    
                                    // @ts-ignore
                                    tooltip.drawTooltip(this.canvasTT.ctx, this.canvasTT.viewport, new Point(tooltipCoordX.x, tooltipCoordX.y), pointDataX, tt_ind_X, this.xAxis.ticks.plotStepX);
                                    break;
                                */

                case "delta_abs":
                  // if (!tooltipCoordX) tooltipCoordX = series.getClosestPlotPointX(new Point(mouseXY.x+this.canvasTT.left, mouseXY.y+this.canvasTT.top));

                  if (delta_abs_buf.length == 0) {
                    delta_abs_buf.push(pointData);
                    delta_abs_buf_coord.push(tooltipCoordX);
                  } else {
                    tt.coord =
                      delta_abs_buf_coord[0].y < tooltipCoordX.y
                        ? delta_abs_buf_coord[0]
                        : tooltipCoordX;
                    tt.data = new Point(
                      Math.abs(pointData.x - delta_abs_buf[0].x),
                      Math.abs(pointData.y - delta_abs_buf[0].y)
                    );

                    tooltip.drawTooltip(tt);
                    delta_abs_buf.pop();
                    delta_abs_buf_coord.pop();
                  }
                  break;

                case "data_y_end":
                  data_y_end_buf.push([tooltip, tooltipCoordX, pointData]);
                  break;

                case "data_label":
                  tt.coord = new Point(tooltipCoordXY.x, tooltipCoordXY.y);
                  tt.data = pointDataXY;
                  tt.ind = tt_ind_XY;
                  tooltip.drawTooltip(tt);
                  // @ts-ignore
                  if (plot.type == "unicode")
                    plot.drawPlot(
                      false,
                      // @ts-ignore
                      this.canvasTT.ctx,
                      [tooltipCoordXY],
                      this.canvasTT.viewport,
                      "",
                      true
                    );
                  break;

                case "simple_label":
                  tt.coord = new Point(tooltipCoordX.x, tooltipCoordX.y);
                  tt.data = pointData;
                  tt.ind = tt_ind;
                  tooltip.drawTooltip(tt);
                  break;

                case "bar_chart_highlighter":
                  tt.coord = new Point(tooltipCoordX.x, tooltipCoordX.y);
                  tt.data = pointData;
                  tt.ind = tt_ind;
                  tt.step = plot._options.step;
                  tooltip.drawTooltip(tt);
                  break;

                case "bar_chart_fullheight":
                  tt.coord = new Point(tooltipCoordX.x, tooltipCoordX.y);
                  tt.data = pointData;
                  tt.ind = tt_ind;
                  tt.step = plot._options.step;
                  tooltip.drawTooltip(tt);
                  break;

                default:
                  tt.coord = new Point(tooltipCoordX.x, tooltipCoordX.y);
                  tt.data = pointData;
                  tt.ind = tt_ind;
                  tt.step = this.xAxis.ticks.plotStepX;
                  tooltip.drawTooltip(tt);
                  break;
              }
            }
          });
        }
      });
    });

    // рассталкиваем друг от друга боковые тултипы

    // @ts-ignore
    data_y_end_buf.sort((a, b) => a[1].y - b[1].y);

    let hasOverlap = true;
    let counter = 0;

    while (hasOverlap && counter < data_y_end_buf.length * 2) {
      counter = counter + 1;
      for (let i = 0; i < data_y_end_buf.length - 1; i++) {
        // @ts-ignore
        tt.coord = new Point(data_y_end_buf[i][1].x, data_y_end_buf[i][1].y);
        tt.data = data_y_end_buf[i][2];
        tt.ind = 0;
        tt.toDraw = false;

        const rect1 = data_y_end_buf[i][0].drawTooltip(tt);

        tt.coord = new Point(
          data_y_end_buf[i + 1][1].x,
          data_y_end_buf[i + 1][1].y
        );
        tt.data = data_y_end_buf[i + 1][2];

        const rect2 = data_y_end_buf[i + 1][0].drawTooltip(tt);

        if (rect1.y2 > rect2.y1) {
          const abs = Math.abs(rect1.y2 - rect2.y1);

          let abs1 = -abs * 0.5;
          let abs2 = abs * 0.5;

          if (Math.abs(rect1.y1 - this.canvasTT.viewport.y1) < Math.abs(abs1)) {
            abs1 = -Math.abs(rect1.y1 - this.canvasTT.viewport.y1);
            abs2 = abs + abs1;
          }

          if (Math.abs(rect2.y2 - this.canvasTT.viewport.y2) < abs2) {
            abs2 = -Math.abs(rect1.y2 - this.canvasTT.viewport.y2);
            abs1 = -(abs - abs2);
          }
          // @ts-ignore
          data_y_end_buf[i][1].y = data_y_end_buf[i][1].y + abs1;
          // @ts-ignore
          data_y_end_buf[i + 1][1].y = data_y_end_buf[i + 1][1].y + abs2;
        }
      }

      hasOverlap = false;

      for (let i = 0; i < data_y_end_buf.length - 1; i++) {
        tt.coord = new Point(data_y_end_buf[i][1].x, data_y_end_buf[i][1].y);
        tt.data = data_y_end_buf[i][2];
        tt.ind = 0;
        tt.toDraw = false;

        const rect1 = data_y_end_buf[i][0].drawTooltip(tt);

        tt.coord = new Point(
          data_y_end_buf[i + 1][1].x,
          data_y_end_buf[i + 1][1].y
        );
        tt.data = data_y_end_buf[i + 1][2];

        const rect2 = data_y_end_buf[i + 1][0].drawTooltip(tt);
        // @ts-ignore
        //const rect1 = data_y_end_buf[i][0].drawTooltip(this.canvasTT.ctx, this.canvasTT.viewport, data_y_end_buf[i][1], data_y_end_buf[i][2], 0, false);
        // @ts-ignore
        //const rect2 = data_y_end_buf[i + 1][0].drawTooltip(this.canvasTT.ctx, this.canvasTT.viewport, data_y_end_buf[i + 1][1], data_y_end_buf[i + 1][2], 0, false);
        if (rect1.y2 > rect2.y1) {
          hasOverlap = true;
        }
      }
    }

    // @ts-ignore
    data_y_end_buf.forEach((ttRow) => {
      tt.coord = new Point(ttRow[1].x, ttRow[1].y);
      tt.data = ttRow[2];
      tt.ind = 0;
      tt.toDraw = true;
      ttRow[0].drawTooltip(tt);
    });
  }
}
