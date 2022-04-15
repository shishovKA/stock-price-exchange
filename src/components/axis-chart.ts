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
const canvasPaddings = [0, 65, 8, 25];
const gapY = 0.08;

export let chart: Chart;

// @ts-ignore
export function create_rosie_xAxis_chart(container: HTMLElement, data: any[]) {
  let row: number[] = [];
  let xLabels: Date[] = [];
  [xLabels, row] = [...data];
  const xMax = row.length;

  chart = new Chart(container, [0, xMax], [0, 100]);

  const { xAxis, yAxis } = chart;

  // ось X
  xAxis.display = true;
  xAxis.setOptions("end", 1, "#D7D7D74D");
  xAxis.ticks.display = true;
  xAxis.ticks.settickDrawOptions(-4, 1, "#D7D7D74D");
  xAxis.ticks.label.setOptions(true, "#FFFFFF99", "bottom", 11, [
    "11",
    '"Open Sans"',
  ]);
  const xLabelsStrings = xLabels.map((el) => {
    return el.toLocaleDateString("en", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  });
  xAxis.ticks.setCustomLabels(xLabelsStrings);
  xAxis.ticks.setOptions(true, "niceXDateTicks", [1]);

  // ось Y
  yAxis.display = false;
  yAxis.ticks.label.setOptions(false);

  // создаем Plots
  chart.addPlot("none", "unicode", 0, "#000000", "");

  // создаем Series
  chart.addSeriesRow("fake_series", [row]).setPlotsIds("none");

  // создаем Tooltips
  // chart.findPlotById('none')?.addTooltip('ttId', 'bar_chart_fullheight', 1, '#272727', '#FFFFFF1A', 2);
  chart
    .findPlotById("none")
    ?.addTooltip("ttId", "date_x_bottom", 0.5, "black", "#ffffff", 4, xLabels)
    .label.setOptions(true, "black", "bottom", 20, ["14", '"Open Sans"']);

  // настраиваем Min Max осей
  xAxis.setMinMaxStatic(chart.data.findExtremes("val"));
  xAxis.setMinMaxStatic([chart.xAxis.min - 0.5, chart.xAxis.max + 0.5]);
  yAxis.setMinMaxStatic(
    chart.data.findExtremes("ind", chart.xAxis.min, chart.xAxis.max)
  ); //scale to fit по Y
  yAxis.setMinMaxStatic([
    chart.yAxis.min - gapY * chart.yAxis.length,
    chart.yAxis.max + gapY * chart.yAxis.length,
  ]);

  // задаем отступы для области отрисовки
  chart.xAxis.ticks.switchAnimation(true, 300);
  const easing = bezier(0.65, 0, 0.35, 1);
  chart.data.changeAllSeriesAnimationTimeFunction(easing);
  chart.setCanvasPaddings(...canvasPaddings);
  chart.refresh();
  return chart;
}

export const changeRange = (data: any[]) => {
  const [xLabels, row] = [...data];
  const xLabelsStrings = xLabels.map((el: any) => {
    return el.toLocaleDateString("en", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  });
  chart.data.findSeriesById("fake_series")?.replaceSeriesData([row], false);

  chart.xAxis.ticks.setCustomLabels(xLabelsStrings);
  chart
    .findPlotById("none")
    ?.findTooltipById("ttId")
    ?.setOptions([0.5, "black", "#ffffff", 4, xLabels]);

  chart.xAxis.setMinMax(chart.data.findExtremes("val"), false);
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
  );
};
