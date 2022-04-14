<template>
  <div class="sidebar">
    <div class="logo__container">
      <img src="../../src/assets/socks.png" />
      <h1 class="title">Stocks in socks</h1>
    </div>
    <div class="menu">
      <router-link class="menu__link" to="/dashboard">
        <img src="../../src/assets/chart-histogram.svg" />
        Dashboard
      </router-link>
      <router-link
        :disabled="true"
        to="/portfolio"
        class="menu__link disabled"
        :event="''"
      >
        <img src="../../src/assets/handbag.svg" />
        Portfolio
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Sidebar extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.sidebar {
  flex: 0 1 200px;
  background-color: #1e1c1c;
  font-family: "Open Sans";
  font-style: normal;
  color: #edeff1;
}

.logo__container {
  height: 72px;
  background-color: #080808;
  display: flex;
  align-items: center;
  padding: 1.6rem 2rem;
  img {
    width: 40px;
    height: 40px;
  }
}

.title {
  font-style: normal;
  font-weight: 400;
  font-size: 17px;
  line-height: 24px;
}

.menu {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 2rem 0 0 2rem;
}

.menu__link {
  font-weight: 400;
  font-size: 17px;
  line-height: 24px;
  color: #edeff1;
  text-transform: none;
  text-decoration: none;
  outline: none;
  height: 44px;
  display: flex;
  align-items: center;
  img {
    margin-right: 16px;
    filter: invert(96%) sepia(4%) saturate(93%) hue-rotate(170deg)
      brightness(101%) contrast(92%);
  }
  &:hover {
    opacity: 0.8;
  }
}

.disabled {
  opacity: 0.3;
  &:hover {
    opacity: 0.3;
  }
}

.router-link-active {
  color: #dbf86d;
  img {
    filter: invert(97%) sepia(12%) saturate(1763%) hue-rotate(13deg)
      brightness(96%) contrast(104%);
  }
}
</style>
