<template>
  <div class="main-page">
    <StocksTable />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import StocksTable from "@/components/StocksTable.vue";

@Component({
  components: {
    StocksTable,
  },
})
export default class HomeView extends Vue {}
</script>

<style lang="less" scoped>
.main-page {
  width: 100%;
  flex: 1 1 auto;
  background-color: black;
}
</style>
