<template>
  <div class="chart-panel">
    <div class="menu__container">
      <div class="menu">
        <p
          v-for="(item, index) of rangeMenu"
          :key="index"
          class="menu__item"
          :class="{ menu__item_selected: item.selected }"
          @click="selectRange(index)"
        >
          {{ item.title }}
        </p>
      </div>
    </div>

    <h3 class="historical-data__title">HISTORICAL DATA</h3>

    <div class="chart__container chart__container_axis">
      <div id="rosie-charts_axis"></div>
    </div>

    <div class="chart__container">
      <div class="chart-label-container chart-label-container_stock">
        <p class="square-label">Stock Price</p>
      </div>
      <div id="rosie-charts_1">
        <p v-if="chartsDataIsEmpty" class="chart__empty">No data</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Chart } from "@/chart-lib";
import { Component, Vue, Prop } from "vue-property-decorator";

import {
  create_rosie_xAxis_chart,
  changeRange as changeRange_axis,
} from "./axis-chart";
import {
  createChart_1,
  changeRange as changeRange_1,
} from "./stock-price-chart";

@Component
export default class ChartPanel extends Vue {
  @Prop() data!: any[];
  private chart_axis: Chart | undefined = undefined;
  private chart_1: Chart | undefined = undefined;

  rangeMenu = [
    { title: "3m", selected: true },
    { title: "6m", selected: false },
    { title: "1y", selected: false },
  ];

  mounted() {
    const symbol = this.$route.params.symbol;
    const to = new Date();
    const from = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    this.$store
      .dispatch("fetchCompanyHistoricalData", {
        symbol,
        from: this.formatDate(from),
        to: this.formatDate(to),
      })
      .then(() => {
        console.log("data", this.data);
        if (!this.chartsDataIsEmpty) {
          this.chartsInit_once();
        }
      });
  }

  formatDate(d: Date) {
    let month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  get rangeOption() {
    return this.rangeMenu.find((item) => item.selected)?.title;
  }

  get dateArray(): Date[] {
    const dateList = this.data.map((el: any) => new Date(el.date));
    if (!this.rangeOption || this.rangeOption === "All") return dateList;
    const lastDate = dateList[dateList.length - 1];
    let minDate: Date = new Date();
    switch (this.rangeOption) {
      case "3m":
        minDate = new Date(
          new Date(lastDate.getTime()).setMonth(lastDate.getMonth() - 3)
        );
        break;
      case "6m":
        minDate = new Date(
          new Date(lastDate.getTime()).setMonth(lastDate.getMonth() - 6)
        );
        break;
      case "1y":
        minDate = new Date(
          new Date(lastDate.getTime()).setFullYear(lastDate.getFullYear() - 1)
        );
        break;
    }
    return dateList.filter((el: Date) => {
      return el.getTime() >= minDate.getTime();
    });
  }

  get stockPriceData() {
    // return [];
    const initialData = this.data;
    let startDate: Date;
    if (this.dateArray.length !== 0) {
      startDate = this.dateArray[0];
    } else {
      return [];
    }

    const rangedData = initialData.filter((el: any) => {
      const date = new Date(el.date);
      return date.getTime() >= startDate.getTime();
    });

    const result = rangedData.map((el: any, ind: number) => {
      return {
        date: el.date,
        adjusted_close: el.adjClose,
      };
    });
    return result;
  }

  get axis_DateObj(): Date[] {
    return this.dateArray;
  }

  get stock_dataRow(): number[] {
    return this.stockPriceData.map((el: any) => el.adjusted_close);
  }

  get stock_DateObj(): Date[] {
    return this.stockPriceData.map((el: any) => new Date(el.date));
  }

  get stock_DateString(): string[] {
    return this.stock_DateObj.map((el: Date) => el.toLocaleDateString("en"));
  }

  get chartsDataIsEmpty(): boolean {
    return this.data.length === 0;
  }

  selectRange(index: number) {
    this.rangeMenu.forEach((item, ind) => (item.selected = index === ind));
    if (this.chart_axis)
      changeRange_axis([this.axis_DateObj, this.axis_DateObj.map(() => 0)]);
    if (this.chart_1) changeRange_1(this.stock_dataRow);
  }

  chartsInit_once() {
    const chart_container_axis = document.getElementById("rosie-charts_axis");
    if (chart_container_axis && this.axis_DateObj.length !== 0) {
      this.chart_axis = create_rosie_xAxis_chart(chart_container_axis, [
        this.axis_DateObj,
        this.axis_DateObj.map(() => 0),
      ]);
    }

    const chart_container_1 = document.getElementById("rosie-charts_1");
    if (chart_container_1 && !this.chartsDataIsEmpty) {
      this.chart_1 = createChart_1(chart_container_1, [
        this.stock_DateString,
        this.stock_dataRow,
      ]);
    }

    if (this.chart_axis) {
      if (this.chart_1) this.chart_axis.bindOtherChartTooltips(this.chart_1);
    }

    if (this.chart_1) {
      if (this.chart_axis) this.chart_1.bindOtherChartTooltips(this.chart_axis);
    }
  }
}
</script>

<style scoped lang="less">
.chart-panel {
  width: 100%;
  padding: 1rem 2.5rem;
}

.chart__container {
  position: relative;
  width: 100%;
}

.chart__container_axis {
  position: sticky;
  top: 10px;
  z-index: 5;
}

.chart-label-container {
  position: absolute;
  left: calc(25px + 7px + 8px);
  top: 0px;
  display: flex;
  align-items: center;
  p {
    font-style: normal;
    font-weight: bold;
    font-size: 13px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    color: #ffffff;
    margin: 0;
    z-index: 10;
    span {
      margin-left: 8px;
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 18px;
      display: flex;
      align-items: center;
      color: #ffffff;
      opacity: 0.6;
      text-transform: none;
    }
  }
}

.square-label {
  position: relative;
}

.square-label::after {
  content: "";
  position: absolute;
  top: calc(50% - 0.5 * 7px);
  left: calc(-7px - 8px);
  width: 7px;
  height: 7px;
  background-color: #1f1f1f;
}

.square-label_red::after {
  background-color: #d93f30;
}

.square-label_yellow::after {
  background-color: #ecba44;
}

.square-label_green::after {
  background-color: #3d894c;
}

.chart-label-container_stock {
  top: -5px;
}

.chart-label-container_recon {
  top: 50px;
}

.chart-label-container_attack {
  top: 30px;
}

.chart-label-container_netacc {
  top: 10px;
}

#rosie-charts_axis {
  width: 100%;
  height: 50px;
}

#rosie-charts_1 {
  width: 100%;
  height: 200px;
}

#rosie-charts_2 {
  width: 100%;
  height: calc(200px + 62px);
}

#rosie-charts_3 {
  width: 100%;
  height: calc(200px + 42px);
}

#rosie-charts_4 {
  width: 100%;
  height: calc(200px + 22px);
}

.chart__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  font-family: "Open Sans";
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 24px;
  /* identical to box height, or 171% */
  color: #ffffff;
  opacity: 0.3;
  background-color: #ffffff13;
}

.menu__container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.menu {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  border: 1px solid #3d3d3d;
  border-radius: 5px;
  margin: 0 0 27px 25px;
  width: fit-content;
}

.menu__item {
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  color: #ffffff4d;
  margin: 0;
  padding: 5px 12px;
  cursor: pointer;
  text-transform: capitalize;
  border-right: 1px solid #3d3d3d;
  user-select: none;
  &:last-of-type {
    border-right: none;
  }
}

.menu__item_selected {
  background: #393939;
  color: #ffffff99;
}

.download {
  text-transform: none;
  margin: 0 0 0 10px;
  border: 1px solid #3d3d3d;
  border-radius: 5px;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  color: #ffffff4d;
  padding: 5px 12px;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: #393939;
    color: #ffffff99;
  }
}
</style>
