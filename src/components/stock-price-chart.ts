/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Chart } from "../chart-lib/index";
import { Ticks } from "../chart-lib/index";
import bezier from "bezier-easing";

// @ts-ignore

// common decoration variables
const yTicksDrawOptions: [number, number, string] = [-4, 1, "#FFFFFF80"];
const yGridDrawOptions: [boolean, string, number, number[]] = [
  true,
  "#FFFFFF33",
  1,
  [1, 2],
];
const gapY = 0.08; // % gap for Y axis sacle to fit

export let chart: Chart;

// @ts-ignore
export function createChart_1(container: HTMLElement, data: any[]) {
  let row: number[] = [];
  let xLabels: string[] = [];

  [xLabels, row] = [...data];
  const xMax = row.length;
  chart = new Chart(container, [0, xMax], [0, 100]);
  const { xAxis, yAxis } = chart;

  // ось X
  xAxis.display = false;
  xAxis.ticks.label.setOptions(false);

  // ось Y
  yAxis.setOptions("end");
  yAxis.display = false;
  yAxis.ticks.setOptions(
    true,
    "niceCbhStep",
    [1, 5, 10, 20, 30, 50, 100, 200, 500, 1000, 2000, 4000]
  );
  yAxis.ticks.settickDrawOptions(...yTicksDrawOptions);
  yAxis.ticks.label
    .setOptions(true, "#B2B2B2", "right", 0)
    .setFontOptions(12, "Open Sans", "normal")
    .setOffset(25, 0).units = "$";
  yAxis.grid.setOptions(...yGridDrawOptions);

  // создаем Plots
  chart.addPlot("green_line", "line", 1.4, "#3D894C", []);
  chart.addPlot("red_area", "area", 0, "#D93F304D", "#5C2E2A", 0);
  chart.addPlot("green_area", "area", 0, "#3D894C4D", "#355B3D4D", 0);
  chart.addPlot("red_line", "line", 1.4, "#D93F30", []);
  chart.addPlot("zero_line", "line", 1.4, "#525252", []);

  // создаем Series

  const [
    rowAfter,
    green_line,
    green_top,
    green_bot,
    red_top,
    red_bot,
    zeroSeries,
  ] = prepareDataRows(row);
  row = rowAfter;

  chart.addSeriesRow("area_1", [red_top, red_bot]).setPlotsIds("red_area");
  chart
    .addSeriesRow("area_2", [green_top, green_bot])
    .setPlotsIds("green_area");
  chart.addSeriesRow("line_1", [row]).setPlotsIds("red_line");
  chart.addSeriesRow("line_2", [green_line]).setPlotsIds("green_line");
  chart.addSeriesRow("line_z", [zeroSeries]).setPlotsIds("zero_line");

  // создаем Tooltips
  const labels_values = row.map((el) => el.toFixed(2) + "%");

  chart
    .findPlotById("red_line")
    ?.addTooltip("ttId", "bar_chart_fullheight", 1, "#272727", "#FFFFFF1A", 2);
  chart
    .findPlotById("red_line")
    ?.addTooltip(
      "value",
      "simple_label",
      0.5,
      "#F9F9F9",
      "#F9F9F9",
      labels_values
    )
    .label.setOptions(true, "#FFFFFF", "top", 0, ["11", '"Open Sans"'])
    .setCenterX(0)
    .setOffset(-5, 5);

  // настраиваем Min Max осей
  xAxis.setMinMaxStatic(chart.data.findExtremes("val")); //по экстремумам оси X
  xAxis.setMinMaxStatic([chart.xAxis.min - 0.5, chart.xAxis.max + 0.5]);
  yAxis.setMinMaxStatic(
    chart.data.findExtremes("ind", chart.xAxis.min, chart.xAxis.max)
  ); //scale to fit по Y
  yAxis.setMinMaxStatic([
    chart.yAxis.min - gapY * chart.yAxis.length,
    chart.yAxis.max + gapY * chart.yAxis.length,
  ]); //добавляем по отступам как на сайте

  // задаем отступы для области отрисовки
  chart.yAxis.ticks.switchAnimation(true, 300);
  chart.switchDataAnimation(true, 300);
  const easing = bezier(0.65, 0, 0.35, 1);
  chart.data.changeAllSeriesAnimationTimeFunction(easing);
  chart.setCanvasPaddings(8, 65, 8, 25);
  chart.refresh();
  return chart;
}

export const changeRange = (row: number[]) => {
  const [
    rowAfter,
    green_line,
    green_top,
    green_bot,
    red_top,
    red_bot,
    zeroSeries,
  ] = prepareDataRows(row);
  chart.data
    .findSeriesById("area_1")
    ?.replaceSeriesData([red_top, red_bot], false);
  chart.data
    .findSeriesById("area_2")
    ?.replaceSeriesData([green_top, green_bot], false);
  chart.data.findSeriesById("line_1")?.replaceSeriesData([rowAfter], false);
  chart.data.findSeriesById("line_2")?.replaceSeriesData([green_line], false);
  chart.data.findSeriesById("line_z")?.replaceSeriesData([zeroSeries], false);

  const labels_values = row.map((el) => el.toFixed(2) + "$");
  chart
    .findPlotById("red_line")
    ?.findTooltipById("value")
    ?.setOptions([0.5, "#F9F9F9", "#F9F9F9", labels_values]);

  chart.xAxis.setMinMax(chart.data.findExtremes("val"), false); //по экстремумам оси X
  chart.xAxis.setMinMax([chart.xAxis.min - 0.5, chart.xAxis.max + 0.5], false);
  chart.yAxis.setMinMax(
    chart.data.findExtremes("ind", chart.xAxis.min, chart.xAxis.max),
    false
  ); //scale to fit по Y
  chart.yAxis.setMinMax(
    [
      chart.yAxis.min - gapY * chart.yAxis.length,
      chart.yAxis.max + gapY * chart.yAxis.length,
    ],
    true
  ); //добавляем по отступам как на сайте
};

export function prepareDataRows(row: number[]) {
  row = row.reduce(
    (sum: number[], current: number, index: number, arr: number[]) => {
      const next = arr[index + 1];
      if (current < 0 && next > 0) {
        sum.push(0);
        return sum;
      }
      if (current > 0 && next < 0) {
        sum.push(0);
        return sum;
      }
      sum.push(current);
      return sum;
    },
    []
  );

  const green_line = row.map((value: number, ind: number, arr: number[]) => {
    const next = arr[ind + 1];
    if (value < 0) {
      return 0;
    }
    return value;
  });

  const green_top = row.map((value: number) => {
    return value;
  });

  const green_bot = row.map((value: number) => {
    if (value < 0) return value;
    return 0;
  });

  const red_top = row.map((value: number) => {
    return value;
  });

  const red_bot = row.map((value: number) => {
    if (value < 0) return 0;
    return value;
  });
  const zeroSeries = row.map(() => 0);
  return [row, green_line, green_top, green_bot, red_top, red_bot, zeroSeries];
}
