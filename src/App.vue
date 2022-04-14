<template>
  <div id="app">
    <Sidebar />
    <div class="page__container">
      <Header />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";

@Component({
  components: {
    Sidebar,
    Header,
  },
})
export default class App extends Vue {
  created() {
    this.$store.dispatch("loadStoragedList");
  }
}
</script>

<style lang="less">
* {
  box-sizing: border-box;
}

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
  background: #333333;
  color: #edeff1;
}

#app {
  display: flex;
  flex-direction: row;
}

.page__container {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
</style>
