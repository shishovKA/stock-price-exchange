import { Plot } from '../Plot';
import { Point } from '../../Point';
import { Rectangle } from '../../Rectangle';

export const drawBarChart = function (
  this: Plot,
  ctx: CanvasRenderingContext2D,
  plotData: Point[],
  vp: Rectangle
) {
  let stepWidth = vp.width;
  if (plotData.length >= 2) {
    /*
        const sumDelta = plotData.reduce((prev, cur, index, arr) => {
            if (index !== 0) {
                prev = prev + cur.x - arr[index - 1].x;
            }
            return prev;
        }, 0)
        */
    const deltaArr = plotData.reduce((prev: number[], cur, index, arr) => {
      if (index !== 0) {
        prev.push(cur.x - arr[index - 1].x);
      }
      return prev;
    }, []);
    // stepWidth = (plotData[1].x-plotData[0].x)
    // stepWidth = vp.width / plotData.length;
    // stepWidth = sumDelta / (plotData.length - 1);
    // stepWidth = (plotData[plotData.length - 1].x-plotData[0].x) / (plotData.length - 1);
    stepWidth = Math.max(...deltaArr);
  }
  stepWidth = stepWidth - this._options.mainSize;

  for (let i = 0; i < plotData.length; i++) {
    ctx.beginPath();
    ctx.lineTo(plotData[i].x - stepWidth * 0.5, vp.zeroY);
    ctx.lineTo(plotData[i].x - stepWidth * 0.5, plotData[i].y);
    ctx.lineTo(plotData[i].x + stepWidth * 0.5, plotData[i].y);
    ctx.lineTo(plotData[i].x + stepWidth * 0.5, vp.zeroY);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.lineTo(plotData[i].x - stepWidth * 0.5, plotData[i].y);
    ctx.lineTo(plotData[i].x + stepWidth * 0.5, plotData[i].y);
    ctx.closePath();
    ctx.stroke();
  }
};
