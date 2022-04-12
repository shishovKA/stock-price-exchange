<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Header from "@/components/Header.vue";

@Component({
  components: {
    Header,
  },
})
export default class App extends Vue {}
</script>

<style lang="less">
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  font-family: "Open Sans", sans-serif;
}

html {
  font-size: 62.5%;
  height: 100%;
}

body {
  margin: 0px;
  margin-left: auto;
  margin-right: auto;
  min-height: 100%;
  background: #e5e5e5;
}
</style>
