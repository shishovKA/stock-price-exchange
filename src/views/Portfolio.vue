<template>
  <div class="main-page">Portfolio</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Portfolio extends Vue {}
</script>

<style lang="less" scoped>
.main-page {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  overflow-y: auto;
}
</style>
