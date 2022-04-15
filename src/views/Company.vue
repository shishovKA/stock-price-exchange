<template>
  <div class="main-page">
    <ChartPanel :data="chartData" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ChartPanel from "@/components/ChartPanel.vue";

@Component({ components: { ChartPanel } })
export default class Company extends Vue {
  created() {
    const symbol = this.$route.params.symbol;
  }

  get chartData() {
    return this.$store.getters.companyChartData;
  }
}
</script>

<style lang="less" scoped>
.main-page {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  overflow-y: auto;
}
</style>
