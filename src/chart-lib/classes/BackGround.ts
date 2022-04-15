/* eslint-disable no-fallthrough */
import { Canvas } from "./Canvas";
import { Point } from "./Point";

export class BackGround {
  type = "default";
  canvas: Canvas;

  constructor(type: string, container: HTMLElement) {
    this.type = type;
    this.canvas = new Canvas(container);
    this.canvas.canvas.style.zIndex = "1";
  }

  draw(xCoord: Point[], yCoord: Point[]) {
    this.canvas.clear();
    switch (this.type) {
      case "coloredGrid_cbh":
        this.drawColoredGrid(xCoord, yCoord);
      case "coloredGrid_cbh_v2":
        this.drawColoredGrid_v2(xCoord, yCoord);
        break;
    }
  }

  drawColoredGrid(xCoord: Point[], yCoord: Point[]) {
    const ctx = this.canvas.ctx;

    if (ctx) {
      ctx.globalAlpha = 0.1;
      const colorPalette: string[] = [
        "#8CCB76",
        "#BED68D",
        "#E7D180",
        "#CC9263",
        "#CF5031",
      ];

      for (let i = 0; i < xCoord.length - 1; i++) {
        ctx.fillStyle = colorPalette[i];
        ctx.fillRect(
          xCoord[i].x,
          yCoord[0].y,
          xCoord[i + 1].x - xCoord[i].x,
          yCoord[yCoord.length - 1].y - yCoord[0].y
        );
      }

      for (let i = 0; i < yCoord.length - 1; i++) {
        ctx.fillStyle = colorPalette[i];
        ctx.fillRect(
          xCoord[0].x,
          yCoord[i].y,
          xCoord[xCoord.length - 1].x - xCoord[0].x,
          yCoord[i + 1].y - yCoord[i].y
        );
      }

      ctx.globalAlpha = 1;
    }
  }

  drawColoredGrid_v2(xCoord: Point[], yCoord: Point[]) {
    const ctx = this.canvas.ctx;

    if (ctx) {
      ctx.globalAlpha = 0.2;
      const colorPalette: string[] = [
        "#3D894C",
        "#3D894C",
        "#ECBA44",
        "#D93F30",
        "#D93F30",
      ];

      for (let color = 0; color < colorPalette.length; color++) {
        for (let i = 0; i < xCoord.length - 1 - color; i++) {
          for (let j = 0; j < yCoord.length - 1 - color; j++) {
            if (color == 4) ctx.globalAlpha = 0.3;
            ctx.fillStyle = colorPalette[color];
            ctx.fillRect(
              xCoord[i].x,
              yCoord[j].y,
              xCoord[i + 1].x - xCoord[i].x,
              yCoord[j + 1].y - yCoord[j].y
            );
          }
        }
      }

      ctx.globalAlpha = 1;
    }
  }
}
