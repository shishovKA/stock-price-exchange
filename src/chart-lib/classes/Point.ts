export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    //this.x = Math.round(x);
    //this.y = Math.round(y);

    this.x = x;
    this.y = y;
  }

  findDist(next: Point): number {
    const dist = Math.sqrt(
      (this.x - next.x) * (this.x - next.x) +
        (this.y - next.y) * (this.y - next.y)
    );
    return dist;
  }

  findDistX(next: Point): number {
    const dist = Math.abs(this.x - next.x);
    return dist;
  }

  rotate(angle: number, o: Point) {
    const radians = (Math.PI / 180) * -angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (this.x - o.x) + sin * (this.y - o.y) + o.x,
      ny = cos * (this.y - o.y) - sin * (this.x - o.x) + o.y;
    this.x = nx;
    this.y = ny;
    return this;
  }
}
