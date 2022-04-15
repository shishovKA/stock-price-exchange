import { Point } from "./Point";
import { Signal } from "signals";
import { Rectangle } from "./Rectangle";

interface labelOutline {
  width: number;
  color: string;
}

export class Label {
  display = true;

  color = "black";
  colorArr?: string[];
  color_counter = 0;

  fontFamily = "serif";
  fontSize = 16;
  fontWeight = "normal";

  //    isScalebale: boolean = false;
  //    fontTarget: number = 12;
  //    fontBase: number = 1000;

  position = "bottom";
  offset = 0;
  units?: string;
  rotationAngle = 0;
  offsetX = 0;
  offsetY = 0;
  _centerX = -0.5;
  isUpperCase = false;

  fontSizeList: number[] = [];
  queryList: string[] = [];

  hasOutline = false;
  outlineOptions?: labelOutline;

  textDecorator: (text: any) => string = (text: any) => {
    return text;
  };

  onOptionsSetted: Signal;

  constructor(type?: string) {
    this.onOptionsSetted = new Signal();

    switch (type) {
      case "vertical":
        this.position = "left";
        break;

      case "horizontal":
        this.position = "bottom";
        break;
    }
  }

  setTextDecorator(decoratorFunc: (text: any) => string) {
    this.textDecorator = decoratorFunc;
    return this;
  }

  setOptions(
    display: boolean,
    color?: string,
    position?: string,
    offset?: number,
    fontOptions?: any[],
    colorArr?: string[]
  ) {
    this.color = color || "black";
    this.position = position || "bottom";
    this.offset = offset || 0;

    this.display = display;

    if (colorArr) {
      this.colorArr = colorArr;
      this.color_counter = 0;
    }

    if (fontOptions) {
      this.fontFamily = fontOptions[1];
      this.fontSize = +fontOptions[0];

      if (fontOptions[2] !== undefined) {
        if (fontOptions[3] !== undefined) {
          this.fontSizeList = fontOptions[3];
        }
        if (fontOptions[4] !== undefined) {
          this.queryList = fontOptions[4];
        }

        this.turnOnMediaQueries();
      }
    }

    this.onOptionsSetted.dispatch();
    return this;
  }

  setFontSizeMediaQueries(fontSizeList: number[], queryList: string[]) {
    this.fontSizeList = fontSizeList;
    this.queryList = queryList;
    this.turnOnMediaQueries();
    return this;
  }

  setFontOptions(size: number, family: string, weight: string) {
    this.fontSize = size;
    this.fontFamily = family;
    this.fontWeight = weight;
    this.onOptionsSetted.dispatch();
    return this;
  }

  turnOnMediaQueries() {
    this.queryList.forEach((q, ind) => {
      const mediaQuery = window.matchMedia(q);
      mediaQuery.addEventListener("change", () => {
        if (mediaQuery.matches) {
          this.fontSize = this.fontSizeList[ind];
        }
      });
      if (mediaQuery.matches) {
        this.fontSize = this.fontSizeList[ind];
      }
    });
  }

  setCenterX(val: number) {
    this._centerX = val;
    return this;
  }

  /*
    calculateFontSize(ctx: CanvasRenderingContext2D): string {
        if (this.isScalebale) {
            const size = this.getRowHeight(ctx);
            const fontString = `${size}px ${this.fontFamily}`;
            return fontString
        } else {
            const fontString = `${this.fontSize}px ${this.fontFamily}`;
            return fontString
        }  
    }
*/

  getRowHeight(ctx: CanvasRenderingContext2D): number {
    /*
        if (this.isScalebale) {
            const canvasWidth = ctx.canvas.clientWidth;
            const ratio = this.fontTarget / this.fontBase;   // calc ratio
            let size = canvasWidth * ratio;
            if (size > this.fontSize) {
                size = this.fontSize;
            }
            return size
        } else {
            return this.fontSize
        }
        */
    return this.fontSize;
  }

  get font() {
    const fontString = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    return fontString;
  }

  setOutline(options: labelOutline) {
    this.hasOutline = true;
    this.outlineOptions = options;
    return this;
  }

  setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
    this.onOptionsSetted.dispatch();
    return this;
  }

  addOffset(labelCoord: Point) {
    labelCoord.y = labelCoord.y - this.offsetY;
    labelCoord.x = labelCoord.x + this.offsetX;

    switch (this.position) {
      case "top":
        labelCoord.y = labelCoord.y - this.offset - this.fontSize * 0.5;
        break;

      case "bottom":
        labelCoord.y = labelCoord.y + this.offset + this.fontSize * 0.5;
        break;

      case "left":
        labelCoord.x = labelCoord.x - this.offset;
        break;

      case "right":
        labelCoord.x = labelCoord.x + this.offset;
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D, coord: Point, labeltext: string) {
    labeltext = this.textDecorator(labeltext);

    if (this.colorArr) {
      ctx.fillStyle = this.colorArr[this.color_counter];
      this.color_counter = this.color_counter + 1;
      if (this.color_counter == this.colorArr.length) this.color_counter = 0;
    } else {
      ctx.fillStyle = this.color;
    }

    //ctx.font = this.calculateFontSize(ctx);
    ctx.font = this.font;
    ctx.textBaseline = "middle";

    if (this.isUpperCase && typeof labeltext == "string") {
      labeltext = labeltext.toUpperCase();
    }

    const text = ctx.measureText(labeltext);
    const labelCoord = new Point(coord.x + text.width * this._centerX, coord.y);
    this.addOffset(labelCoord);

    let printText = labeltext;
    if (this.units) printText = labeltext + this.units;

    if (this.rotationAngle !== 0) {
      ctx.save();
      ctx.translate(
        labelCoord.x + text.width * 0.5,
        labelCoord.y + this.fontSize * 0.5
      );
      ctx.rotate((Math.PI / 180) * this.rotationAngle);
      ctx.translate(
        -labelCoord.x - text.width * 0.5,
        -labelCoord.y - this.fontSize * 0.5
      );
      ctx.fillText(printText, labelCoord.x, labelCoord.y);

      ctx.restore();
    } else {
      if (this.hasOutline) {
        this.drawOutline(ctx, labelCoord, printText);
      }

      let printTextArr = [""];
      printTextArr = printText.toString().split("\n");

      printTextArr.forEach((row, ind, mas) => {
        const text = ctx.measureText(row);
        const labelRowCoord = new Point(
          coord.x + text.width * this._centerX,
          coord.y
        );
        this.addOffset(labelRowCoord);
        const t = new Point(labelRowCoord.x, labelCoord.y);
        t.y = t.y - (mas.length - ind - 1) * this.getRowHeight(ctx);
        ctx.fillText(row, t.x, t.y);
      });

      //ctx.fillText(printText, labelCoord.x, labelCoord.y);
    }
  }

  drawOutline(ctx: CanvasRenderingContext2D, coord: Point, text: string) {
    if (this.outlineOptions) {
      ctx.lineWidth = this.outlineOptions.width;
      ctx.strokeStyle = this.outlineOptions.color;
      ctx.strokeText(text, coord.x, coord.y);
    }
  }

  getlabelRect(
    ctx: CanvasRenderingContext2D,
    coord: Point,
    labeltext: string
  ): Rectangle {
    labeltext = this.textDecorator(labeltext);
    ctx.font = this.font;
    const text = ctx.measureText(labeltext);

    const labelCoord = new Point(coord.x + text.width * this._centerX, coord.y);

    this.addOffset(labelCoord);
    let textYgap = 0;

    if (this.font.indexOf("Transcript Pro") !== -1) {
      textYgap = 2;
    }

    const labelRect = new Rectangle(
      labelCoord.x,
      labelCoord.y - this.fontSize * 0.5,
      labelCoord.x + text.width,
      labelCoord.y + this.fontSize * 0.5 - textYgap
    );
    return labelRect;
  }
}
