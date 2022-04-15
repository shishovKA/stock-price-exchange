import { Signal } from 'signals';
import { Point } from '../Point';
import { Rectangle } from '../Rectangle';
import { Label } from '../Label';
import { Transformer } from '../Transformer';

// generate methods
import { generateNiceXDateTicks } from './generate-methods/nice-x-date-ticks';

export class Ticks {
  display: boolean = false;
  hasCustomLabels: boolean = false;
  hasAnimation: boolean = false;
  animationDuration: number = 300;

  timeFunc: (time: number) => number = function (time) {
    return time;
  };

  label: Label;

  type: string;
  distributionType: string;
  count: number;
  step: number;

  coords: Point[];
  values: number[];
  labels: string[];

  customLabels?: string[];
  customTicksOptions?: any[];

  // параметры отрисовки тика
  linewidth: number = 2;
  tickSize: number = 5;
  color: string = 'black';
  lineDash: number[] = [];

  onOptionsSetted: Signal;
  onCustomLabelsAdded: Signal;
  onCoordsChanged: Signal;
  onCoordsChangedLast: Signal;

  log_base: number = 10;

  constructor(axistype: string) {
    this.onOptionsSetted = new Signal();
    this.onCustomLabelsAdded = new Signal();
    this.onCoordsChanged = new Signal();
    this.onCoordsChangedLast = new Signal();

    this.coords = [];
    this.values = [];
    this.labels = [];

    this.type = axistype;

    this.label = new Label(this.type);

    this.distributionType = 'default';
    this.count = 5;
    this.step = 100;

    this.bindChildSignals();
  }

  get plotStepX() {
    const stepX = Math.abs(this.coords[1].x - this.coords[0].x);
    return stepX;
  }

  switchAnimation(hasAnimation: boolean, duration?: number) {
    this.hasAnimation = hasAnimation;
    if (duration) this.animationDuration = duration;
  }

  bindChildSignals() {}

  setCustomLabels(labels: string[]) {
    this.hasCustomLabels = true;
    this.customLabels = labels;
    this.onCustomLabelsAdded.dispatch();
  }

  settickDrawOptions(length: number, width: number, color: string, lineDash?: number[]) {
    this.linewidth = width;
    this.tickSize = length;
    this.color = color;
    if (lineDash) this.lineDash = lineDash;
  }

  setOptions(display: boolean, distributionType: string, ...options: any[]) {
    this.display = display;

    switch (distributionType) {
      case 'default':
        this.distributionType = distributionType;
        this.count = options[0];
        break;

      case 'fixedCount':
        this.distributionType = distributionType;
        this.count = options[0];
        break;

      case 'fixedCount_Log':
        this.distributionType = distributionType;
        this.count = options[0];
        break;

      case 'fixedStep':
        this.distributionType = distributionType;
        this.step = options[0];
        break;

      case 'fixedStep_Log10':
        this.distributionType = distributionType;
        this.step = options[0];
        break;

      case 'customDateTicks':
        this.distributionType = distributionType;
        if (options.length !== 0) this.customTicksOptions = options[0];
        break;

      case 'niceCbhStep':
        this.distributionType = distributionType;
        if (options.length !== 0) this.customTicksOptions = options[0];
        break;

      case 'niceXDateTicks':
        this.distributionType = distributionType;
        if (options.length !== 0) this.customTicksOptions = options[0];
        break;

      case 'midStep':
        this.distributionType = distributionType;
        this.count = options[0];
        break;

      case 'zero':
        this.distributionType = distributionType;
        break;

      case 'min':
        this.distributionType = distributionType;
        break;
    }
    this.onOptionsSetted.dispatch();
  }

  createTicks(
    min: number,
    max: number,
    vp: Rectangle,
    ctx: CanvasRenderingContext2D,
    noAnimate?: boolean
  ) {
    let coords = [];

    switch (this.distributionType) {
      case 'default':
        coords = this.generateFixedCountTicks(min, max, vp);
        break;

      case 'fixedStep':
        coords = this.generateFixedStepTicks(min, max, vp);
        break;

      case 'fixedStep_Log10':
        coords = this.generateFixedStepTicks_Log10(min, max, vp);
        break;

      case 'fixedCount':
        coords = this.generateFixedCountTicks(min, max, vp);
        break;

      case 'fixedCount_Log':
        coords = this.generateFixedCountTicks_Log(min, max, vp);
        break;

      case 'customDateTicks':
        //coords = this.generateFixedCountTicksDate(min, max, vp);
        coords = this.generateCustomDateTicks(min, max, vp, ctx);
        break;

      case 'niceCbhStep':
        coords = this.generateNiceCbhTicks(min, max, vp);
        break;

      case 'niceXDateTicks':
        // drawBarChartHighLighter.call(this, t);
        coords = generateNiceXDateTicks.call(this, min, max, vp, ctx);
        break;

      case 'midStep':
        coords = this.generateMidStep(min, max, vp);
        break;

      case 'zero':
        coords = this.generateOneTick(min, max, vp, 0);
        break;

      case 'min':
        coords = this.generateOneTick(min, max, vp, min);
        break;
    }

    //если нужна анимация тиков
    if (this.hasAnimation && !noAnimate) {
      const from = this.makeFromPointArr(this.coords, coords);

      if (from.length == 0) {
        this.coords = [...coords];
        this.onCoordsChanged.dispatch();
        this.onCoordsChangedLast.dispatch();
        return this;
      }

      this.coords = [...from];
      this.onCoordsChanged.dispatch();
      this.onCoordsChangedLast.dispatch();
      this.tickCoordAnimation(from, coords, this.animationDuration);

      return this;
    }

    this.coords = [...coords];
    this.onCoordsChanged.dispatch();
    this.onCoordsChangedLast.dispatch();
  }

  generateOneTick(min: number, max: number, vp: Rectangle, value: number) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let rectXY: number[] = [];
    const transformer = new Transformer();

    switch (this.type) {
      case 'vertical':
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    let pointXY: number[] = [];

    if (this.hasCustomLabels) {
      // @ts-ignore
      this.labels.push(this.customLabels[0]);
    } else {
      this.labels.push(value.toFixed(2).toString());
    }

    switch (this.type) {
      case 'vertical':
        pointXY = [0, value];
        break;

      case 'horizontal':
        pointXY = [value, 0];
        break;
    }

    const valuePoint = new Point(pointXY[0], pointXY[1]);
    const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
    coords.push(coordPoint);
    this.values.push(value);

    return coords;
  }

  generateMidStep(min: number, max: number, vp: Rectangle) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let stepCoord = 0;
    let rectXY: number[] = [];
    const transformer = new Transformer();

    const stepValue = Math.abs(max - min) / this.count;

    switch (this.type) {
      case 'vertical':
        stepCoord = vp.height / this.count;
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        stepCoord = vp.width / this.count;
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    for (let i = 0; i <= this.count - 1; i++) {
      let pointXY: number[] = [];

      const value = min + i * stepValue + stepValue * 0.5;

      if (this.hasCustomLabels) {
        //value = Math.round(value);
        // @ts-ignore
        if (this.customLabels[i]) this.labels.push(this.customLabels[i]);
        // @ts-ignore
        else this.labels.push(this.customLabels[0]);
      } else {
        this.labels.push(value.toFixed(2).toString());
      }

      switch (this.type) {
        case 'vertical':
          pointXY = [0, value];
          break;

        case 'horizontal':
          pointXY = [value, 0];
          break;
      }

      const valuePoint = new Point(pointXY[0], pointXY[1]);
      const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
      coords.push(coordPoint);
      this.values.push(value);
    }

    return coords;
  }

  generateFixedCountTicksDate(min: number, max: number, vp: Rectangle) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let stepCoord = 0;
    let rectXY: number[] = [];
    const transformer = new Transformer();

    const stepValue = Math.abs(max - min) / this.count;

    switch (this.type) {
      case 'vertical':
        stepCoord = vp.height / this.count;
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        stepCoord = vp.width / this.count;
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    for (let i = 0; i <= this.count; i++) {
      let pointXY: number[] = [];

      const value = min + i * stepValue;

      if (this.hasCustomLabels && this.customLabels) {
        // value = Math.round(value);
        // @ts-ignore

        if (this.customLabels.length <= i + 1) {
          this.labels.push(this.customLabels[i]);
        } else this.labels.push(this.customLabels[0]);

        // this.labels.push(this.customLabels[value].toLocaleDateString('en'));
        //const labelText = (this.labels[ind]).toLocaleDateString('en');
      } else {
        this.labels.push(value.toFixed(2).toString());
      }

      switch (this.type) {
        case 'vertical':
          pointXY = [0, value];
          break;

        case 'horizontal':
          pointXY = [value, 0];
          break;
      }

      const valuePoint = new Point(pointXY[0], pointXY[1]);
      const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
      coords.push(coordPoint);
      this.values.push(value);
    }

    return coords;
  }

  generateFixedCountTicks(min: number, max: number, vp: Rectangle) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let stepCoord = 0;
    let rectXY: number[] = [];
    const transformer = new Transformer();

    const stepValue = Math.abs(max - min) / this.count;

    switch (this.type) {
      case 'vertical':
        stepCoord = vp.height / this.count;
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        stepCoord = vp.width / this.count;
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    for (let i = 0; i <= this.count; i++) {
      let pointXY: number[] = [];
      const value = min + i * stepValue;

      if (this.hasCustomLabels) {
        // value = Math.round(value);
        // @ts-ignore
        this.labels.push(this.customLabels[i]);
        //const labelText = (this.labels[ind]).toLocaleDateString('en');
      } else {
        this.labels.push(value.toFixed(2).toString());
      }

      switch (this.type) {
        case 'vertical':
          pointXY = [0, value];
          break;

        case 'horizontal':
          pointXY = [value, 0];
          break;
      }

      const valuePoint = new Point(pointXY[0], pointXY[1]);
      const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
      coords.push(coordPoint);
      this.values.push(value);
    }

    return coords;
  }

  generateFixedCountTicks_Log(min: number, max: number, vp: Rectangle) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let stepCoord = 0;
    let rectXY: number[] = [];
    const transformer = new Transformer();

    const stepValue = Math.abs(max - min) / this.count;

    switch (this.type) {
      case 'vertical':
        stepCoord = vp.height / this.count;
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        stepCoord = vp.width / this.count;
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    for (let i = 0; i <= this.count; i++) {
      let pointXY: number[] = [];
      let value = min + i * stepValue;

      if (this.hasCustomLabels) {
        value = Math.round(value);
        // @ts-ignore
        this.labels.push(this.customLabels[value]);
        //const labelText = (this.labels[ind]).toLocaleDateString('en');
      } else {
        let power = this.log_base ** Math.abs(value);
        if (value < 0) power = -power;
        this.labels.push(power.toString());
      }

      switch (this.type) {
        case 'vertical':
          pointXY = [0, value];
          break;

        case 'horizontal':
          pointXY = [value, 0];
          break;
      }

      const valuePoint = new Point(pointXY[0], pointXY[1]);
      const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
      coords.push(coordPoint);
      this.values.push(value);
    }

    return coords;
  }

  generateFixedStepTicks(min: number, max: number, vp: Rectangle, step?: number, toFixed?: number) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let rectXY: number[] = [];

    let tickStep = this.step;

    if (step) {
      tickStep = step;
    }

    const transformer = new Transformer();

    switch (this.type) {
      case 'vertical':
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    const startValue = 0;
    let curValue = startValue;

    while (curValue < max) {
      if (curValue >= min && curValue <= max) {
        let pointXY: number[] = [];
        let value = curValue;

        if (this.hasCustomLabels) {
          value = Math.round(curValue);
          // @ts-ignore
          this.labels.push(this.customLabels[value]);
        } else {
          if (toFixed !== null) {
            this.labels.push(value.toFixed(toFixed).toString());
          } else {
            this.labels.push(value.toFixed(2).toString());
          }
        }

        switch (this.type) {
          case 'vertical':
            pointXY = [0, value];
            break;

          case 'horizontal':
            pointXY = [value, 0];
            break;
        }

        const valuePoint = new Point(pointXY[0], pointXY[1]);
        const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
        coords.push(coordPoint);
        this.values.push(value);
      }

      curValue = curValue + tickStep;
    }

    curValue = startValue;
    curValue = curValue - tickStep;

    while (curValue > min) {
      if (curValue >= min && curValue <= max) {
        let pointXY: number[] = [];
        let value = curValue;

        if (this.hasCustomLabels) {
          value = Math.round(curValue);
          // @ts-ignore
          this.labels.push(this.customLabels[value]);
        } else {
          if (toFixed !== null) {
            this.labels.push(value.toFixed(toFixed).toString());
          } else {
            this.labels.push(value.toFixed(2).toString());
          }
        }

        switch (this.type) {
          case 'vertical':
            pointXY = [0, value];
            break;

          case 'horizontal':
            pointXY = [value, 0];
            break;
        }

        const valuePoint = new Point(pointXY[0], pointXY[1]);
        const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
        coords.push(coordPoint);
        this.values.push(value);
      }

      curValue = curValue - tickStep;
    }

    return coords;
  }

  generateFixedStepTicks_Log10(
    min: number,
    max: number,
    vp: Rectangle,
    step?: number,
    toFixed?: number
  ) {
    const coords = [];
    this.values = [];
    this.labels = [];
    let rectXY: number[] = [];
    let tickStep = this.step;

    let counter = 0;

    const logStep = (value: number, step: number) => {
      let current = 10 ** Math.abs(value);
      //if (value<0) current = -current;
      current = current + step;
      let result = Math.log10(Math.abs(current));
      if (value < 0) result = -result;
      return result;
    };

    const logStepDown = (value: number, step: number) => {
      let current = 10 ** Math.abs(value);
      //if (value<0) current = -current;
      current = current + step;
      let result = Math.log10(Math.abs(current));
      result = -result;
      return result;
    };

    if (step) {
      tickStep = step;
    }

    const transformer = new Transformer();

    switch (this.type) {
      case 'vertical':
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    const startValue = 0;
    let curValue = startValue;

    while (curValue < max && counter < 20) {
      if (curValue >= min && curValue <= max) {
        let pointXY: number[] = [];
        let value = curValue;

        if (this.hasCustomLabels) {
          value = Math.round(curValue);
          // @ts-ignore
          this.labels.push(this.customLabels[value]);
        } else {
          if (toFixed !== null) {
            this.labels.push(value.toFixed(toFixed).toString());
          } else {
            this.labels.push(value.toFixed(2).toString());
          }
        }

        switch (this.type) {
          case 'vertical':
            pointXY = [0, value];
            break;

          case 'horizontal':
            pointXY = [value, 0];
            break;
        }

        const valuePoint = new Point(pointXY[0], pointXY[1]);
        const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
        coords.push(coordPoint);
        this.values.push(value);
      }

      counter = counter + 1;
      console.log('curValue+', logStep(curValue, 0));
      curValue = logStep(curValue, tickStep);

      //curValue = logStep(curValue, tickStep);
    }

    counter = 0;
    curValue = 1;
    //curValue = logStep(curValue, -tickStep);
    //curValue = logStepDown(curValue, tickStep);

    while (curValue > min && counter < 20) {
      if (curValue >= min && curValue <= max) {
        let pointXY: number[] = [];
        let value = curValue;

        if (this.hasCustomLabels) {
          value = Math.round(curValue);
          // @ts-ignore
          this.labels.push(this.customLabels[value]);
        } else {
          if (toFixed !== null) {
            this.labels.push(value.toFixed(toFixed).toString());
          } else {
            this.labels.push(value.toFixed(2).toString());
          }
        }

        switch (this.type) {
          case 'vertical':
            pointXY = [0, value];
            break;

          case 'horizontal':
            pointXY = [value, 0];
            break;
        }

        const valuePoint = new Point(pointXY[0], pointXY[1]);
        const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
        coords.push(coordPoint);
        this.values.push(value);
      }

      counter = counter + 1;
      curValue = logStepDown(curValue, tickStep);
      //curValue = curValue - tickStep;
      console.log('curValue normal', curValue);
    }

    return coords;
  }

  generateNiceCbhTicks(min: number, max: number, vp: Rectangle) {
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

    return coords;
  }

  generateCustomDateTicks(min: number, max: number, vp: Rectangle, ctx: CanvasRenderingContext2D) {
    let coords = [];
    // @ts-ignore
    for (let j = 0; j < this.customTicksOptions.length; j++) {
      const ticksArr = this.generateCustomDateTicksByOption(j, min, max, vp, ctx);

      coords = ticksArr[0];
      const values = ticksArr[1];
      const labels = ticksArr[2];

      if (this.checkLabelsOverlap(ctx, coords, labels)) {
        this.values = values;
        this.labels = labels;

        if (coords.length <= 2) {
          coords = this.generateFixedCountTicksDate(min, max, vp);
        }
        return coords;
      }
    }

    if (coords.length <= 2) {
      coords = this.generateFixedCountTicksDate(min, max, vp);
    }
    return coords;
  }

  // Метод анимации изменение набора координат тиков
  tickCoordAnimation(from: Point[], to: Point[], duration: number) {
    const start = performance.now();
    // @ts-ignore
    const animate = (time) => {
      let tekTime = (time - start) / duration;
      const timeFraction = this.timeFunc(tekTime);

      if (tekTime > 1) tekTime = 1;

      const tek = from.map((el, i) => {
        return new Point(
          from[i].x + (to[i].x - from[i].x) * timeFraction,
          from[i].y + (to[i].y - from[i].y) * timeFraction
        );
      });

      this.coords = [...tek];
      this.onCoordsChanged.dispatch();

      if (tekTime < 1) {
        requestAnimationFrame(animate);
      } else {
        this.coords = [...to];
        this.onCoordsChanged.dispatch();
        this.onCoordsChangedLast.dispatch();
      }
    };

    requestAnimationFrame(animate);
  }

  makeFromPointArr(from: Point[], to: Point[]): Point[] {
    const resultArr: Point[] = [];

    to.forEach((toPoint) => {
      if (from.length !== 0) {
        const minP = from.reduce((fromPoint, cur) => {
          if (fromPoint.findDist(toPoint) < cur.findDist(toPoint)) return fromPoint;
          return cur;
        }, from[0]);
        resultArr.push(minP);
      }
    });

    return resultArr;
  }

  // генерация пробных тиков

  generateCustomDateTicksByOption(
    j: number,
    min: number,
    max: number,
    vp: Rectangle,
    ctx: CanvasRenderingContext2D
  ): any[] {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let rectXY: number[] = [];
    const transformer = new Transformer();

    switch (this.type) {
      case 'vertical':
        rectXY = [0, min, 1, max];
        break;

      case 'horizontal':
        rectXY = [min, 0, max, 1];
        break;
    }

    const fromRect = new Rectangle(rectXY[0], rectXY[1], rectXY[2], rectXY[3]);

    let pointXY: number[] = [];

    const coords = [];
    const values = [];
    const labels = [];

    let yearDel = 1;
    // @ts-ignore
    const partYear = this.customTicksOptions[j];
    switch (partYear) {
      case '5m':
        yearDel = 2;
        break;

      case '3m':
        yearDel = 3;
        break;

      case '2m':
        yearDel = 4;
        break;

      case '1m':
        yearDel = 6;
        break;

      case 'only year':
        yearDel = 12;
        break;
    }

    // @ts-ignore
    const last = max > this.customLabels.length ? this.customLabels.length : max;

    for (let i = min + 1; i <= last - 1; i++) {
      // @ts-ignore
      const curDate: Date = this.customLabels[i];
      // @ts-ignore
      const preDate: Date = this.customLabels[i - 1];

      //начала годов
      if (curDate.getFullYear() - preDate.getFullYear() !== 0) {
        switch (this.type) {
          case 'vertical':
            pointXY = [0, i];
            break;

          case 'horizontal':
            pointXY = [i, 0];
            break;
        }

        const valuePoint = new Point(pointXY[0], pointXY[1]);
        const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
        coords.push(coordPoint);
        values.push(i);
        labels.push(curDate.getFullYear());
      } else {
        //начала месяцев
        // @ts-ignore
        if (this.customTicksOptions[j] !== partYear || !(curDate.getMonth() % yearDel)) {
          if (curDate.getMonth() - preDate.getMonth() !== 0) {
            switch (this.type) {
              case 'vertical':
                pointXY = [0, i];
                break;

              case 'horizontal':
                pointXY = [i, 0];
                break;
            }

            const valuePoint = new Point(pointXY[0], pointXY[1]);
            const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
            coords.push(coordPoint);
            values.push(i);
            labels.push(monthNames[curDate.getMonth()]);
          }
        }
      }

      //середины месяцев
      // @ts-ignore
      if (this.customTicksOptions[j] == 'half month') {
        if (curDate.getDay() !== 0 && curDate.getDay() !== 6) {
          if (
            ((curDate.getDate() == 14 || curDate.getDate() == 15 || curDate.getDate() == 16) &&
              (curDate.getDay() == 1 || curDate.getDay() == 4)) ||
            (curDate.getDate() == 14 && curDate.getDay() == 5)
          ) {
            switch (this.type) {
              case 'vertical':
                pointXY = [0, i];
                break;

              case 'horizontal':
                pointXY = [i, 0];
                break;
            }

            const valuePoint = new Point(pointXY[0], pointXY[1]);
            const coordPoint = transformer.getVeiwportCoord(fromRect, vp, valuePoint);
            coords.push(coordPoint);
            values.push(i);
            labels.push(curDate.getDate());
          }
        }
      }
    }

    return [coords, values, labels];
  }

  checkLabelsOverlap(ctx: CanvasRenderingContext2D, coords: Point[], labels: string[]): boolean {
    for (let i = 1; i < coords.length; i++) {
      const curRec = this.label.getlabelRect(ctx, coords[i], labels[i]);
      const preRec = this.label.getlabelRect(ctx, coords[i - 1], labels[i - 1]);
      if (curRec.countDistBetweenRects(this.type, preRec) <= 3) return false;
    }
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, viewport: Rectangle) {
    this.coords.forEach((tickCoord, i) => {
      if (this.display) this.drawTick(ctx, tickCoord);
      if (this.label.display) this.label.draw(ctx, tickCoord, this.labels[i]);
    });
    //console.log(this.coords);
  }

  drawTick(ctx: CanvasRenderingContext2D, tick: Point) {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.linewidth;
    ctx.setLineDash(this.lineDash);
    const r = this.tickSize;

    switch (this.type) {
      case 'vertical':
        ctx.moveTo(tick.x - r, tick.y);
        ctx.lineTo(tick.x, tick.y);
        ctx.stroke();
        break;

      case 'horizontal':
        ctx.moveTo(tick.x, tick.y - r);
        ctx.lineTo(tick.x, tick.y);
        ctx.stroke();
        break;
    }
  }
}
