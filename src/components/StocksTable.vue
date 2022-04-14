<template>
  <div class="table">
    <transition-group tag="div" name="list">
      <div v-for="row in table" :key="row.symbol" class="row">
        <p
          class="symbol"
          :class="{
            pos_bg: row.regularMarketChangePercent > 0,
            neg_bg: row.regularMarketChangePercent < 0,
          }"
        >
          {{ row.symbol }}
        </p>
        <p class="company-name">{{ row.longName }}</p>
        <p class="price">
          {{ row.regularMarketPrice }}
          <span class="postfix">{{ row.currencySymbol }}</span>
          <span
            class="arrow"
            :class="{
              pos: row.regularMarketChangePercent > 0,
              neg: row.regularMarketChangePercent < 0,
            }"
          >
            ▲
          </span>
        </p>
        <p class="percent">
          {{ row.regularMarketChangePercent }}<span class="postfix">%</span>
          <span
            class="arrow"
            :class="{
              pos: row.regularMarketChangePercent > 0,
              neg: row.regularMarketChangePercent < 0,
            }"
          >
            ▲
          </span>
        </p>
      </div>
    </transition-group>
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
  background-color: #1e1c1c;
  flex: 1 1 100%;
  overflow-y: auto;
}

.row {
  display: grid;
  grid-template-columns: 100px 4fr 2fr 3fr;
  grid-gap: 10px;
  font-size: 16px;
  padding: 8px 4rem;
  margin: 3px 0;
  border-radius: 4px;
  background-color: #333333;
  p {
    margin: 0;
    display: flex;
    align-items: center;
  }
}

.symbol {
  width: 60px;
  padding: 2px 10px;
  border-radius: 10px;
  background-color: #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 1px 2px -1px rgba(0, 0, 0, 0.88);
  &.pos_bg {
    background: rgba(219, 248, 109, 0.4);
    backdrop-filter: blur(10px);
  }
  &.neg_bg {
    background: rgba(255, 119, 119, 0.4);
    backdrop-filter: blur(10px);
  }
}

.company-name {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.price {
  justify-content: right;
}

.percent {
  justify-content: right;
}

.pos {
  color: #a9cc6e;
}

.neg {
  color: #ff7777;
}

.arrow {
  font-size: 12px;
  margin-left: 4px;

  &.neg {
    transform: rotate(180deg);
  }
}

.postfix {
  margin-left: 4px;
  opacity: 0.4;
}

.list-enter-active,
.list-leave-active,
.list-move {
  transition: 500ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}

.list-enter {
  opacity: 0;
  transform: translateX(50px) scaleY(0.5);
}

.list-enter-to {
  opacity: 1;
  transform: translateX(0) scaleY(1);
}

.list-leave-active {
  position: absolute;
}

.list-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center top;
}
</style>
