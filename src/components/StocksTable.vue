<template>
  <div class="table">
    <div v-for="row in table" :key="row.symbol" class="row">
      <p>{{ row.symbol }}</p>
      <p>{{ row.longName }}</p>
      <p>
        {{ row.postMarketPrice }}<span> {{ row.currencySymbol }}</span>
      </p>
      <p>{{ row.regularMarketChangePercent }}<span> %</span></p>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, Vue } from "vue-property-decorator";

@Component
export default class StocksTable extends Vue {
  get table() {
    return this.$store.getters.stocksTable;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table {
  width: 100%;
  padding: 1rem 5rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  grid-gap: 10px;
  color: whitesmoke;
  font-size: 16px;
}
</style>
