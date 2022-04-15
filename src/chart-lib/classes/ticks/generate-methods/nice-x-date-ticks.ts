import { Ticks } from '../Ticks';
import { Rectangle } from '../../Rectangle';
import { Point } from '../../Point';

export const generateNiceXDateTicks = function (
  this: Ticks,
  min: number,
  max: number,
  vp: Rectangle,
  ctx: CanvasRenderingContext2D
): Point[] {
  let coords = [];

  let deviation = Math.abs(max - min);
  let devInd = 0;

  // @ts-ignore
  for (let j = 0; j < this.customTicksOptions.length; j++) {
    // @ts-ignore
    coords = this.generateFixedStepTicks(min, max, vp, this.customTicksOptions[j], 0);
    const maxValue = this.values.reduce((prev, element) => {
      return element > prev ? element : prev;
    }, this.values[0]);

    if (Math.abs(maxValue - max) < deviation && coords.length <= 10 && coords.length >= 4) {
      devInd = j;
      deviation = Math.abs(maxValue - max);
    }
  }
  // @ts-ignore
  coords = this.generateFixedStepTicks(min, max, vp, this.customTicksOptions[devInd], 0);

  let startLables = this.labels;
  let reduceNumber = 1;
  let isOverlap = checkLabelsOverlap.call(this, ctx, coords, startLables);

  while (!isOverlap && reduceNumber < this.labels.length) {
    startLables = reduceLabels(this.labels, reduceNumber);
    isOverlap = checkLabelsOverlap.call(this, ctx, coords, startLables);
    reduceNumber = reduceNumber + 1;
  }

  this.labels = startLables;
  return coords;
};

const reduceLabels = (labels: string[], reduceNumber: number): string[] => {
  const resultStart = [];
  const resultEnd = [];
  let counter = 1;
  resultStart.push(labels[0]);
  resultEnd.unshift(labels[labels.length - 1]);
  for (let i = 1; i < Math.floor((labels.length - reduceNumber) / 2); i++) {
    if (counter === 0) {
      for (let j = 0; j < reduceNumber; j++) {
        resultStart.push('');
        resultEnd.unshift('');
      }
      resultStart.push(labels[i]);
      resultEnd.unshift(labels[labels.length - i - 1]);
    }
    counter = counter + 1;
    if (counter > reduceNumber) {
      counter = 0;
    }
  }

  const buf = [];
  const bufLength = labels.length - resultStart.length - resultEnd.length;
  for (let i = 0; i < bufLength; i++) {
    buf.push('');
  }

  if (bufLength > reduceNumber * 2) {
    buf[reduceNumber] = labels[resultStart.length - 1 + reduceNumber];
  }

  const result = [...resultStart, ...buf, ...resultEnd];
  return result;
};

const checkLabelsOverlap = function (
  this: Ticks,
  ctx: CanvasRenderingContext2D,
  coords: Point[],
  labels: string[]
): boolean {
  const curRec = this.label.getlabelRect(ctx, coords[0], labels[0]);
  let nextNumber = 1;
  for (let i = 1; i < labels.length; i++) {
    if (labels[i] !== '') {
      nextNumber = i;
      break;
    }
  }
  const nextRec = this.label.getlabelRect(ctx, coords[nextNumber], labels[nextNumber]);
  if (nextRec.countDistBetweenRects('horizontal', curRec) <= 1) return false;
  return true;
};
