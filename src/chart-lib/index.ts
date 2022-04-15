// browserify ./src/index.ts -p [ tsify --noImplicitAny ] > chart-bundle.js

export { Chart } from "./classes/Chart";
export { Ticks } from "./classes/ticks/Ticks";
export { Legend } from "./classes/Legend";
export { Point } from "./classes/Point";
export { Rectangle } from "./classes/Rectangle";
export { Label } from "./classes/Label";
