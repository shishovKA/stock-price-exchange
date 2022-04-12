<template>
  <header>
    <p class="title">🧦 Stock in sock</p>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Header extends Vue {
  @Prop() private msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
header {
  background: plum;
  width: 100%;
  padding: 1rem;
}

.title {
  font-family: Inter;
  color: white;
  margin: 0;
  font-size: 20px;
}
</style>
