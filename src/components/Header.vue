<template>
  <header>
    <p class="title">🧦 Stocks in socks</p>
    <autocomplete
      ref="searchInput"
      :search="search"
      :auto-select="true"
      :debounce-time="250"
      placeholder="search a company"
      class="search"
      @submit="handleSubmit"
    >
    </autocomplete>
  </header>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, Vue } from "vue-property-decorator";
// @ts-ignore
import Autocomplete from "@trevoreyre/autocomplete-vue";
import "@trevoreyre/autocomplete-vue/dist/style.css";

@Component({
  components: {
    Autocomplete,
  },
})
export default class Header extends Vue {
  get symbolList() {
    return this.$store.getters.companiesSymbolList;
  }

  search(input: string) {
    if (input.length < 1) {
      return [];
    }
    const result = this.symbolList.filter(
      (cmp: { Symbol: string; Name: string }) => {
        const searchStr = cmp.Symbol + " " + cmp.Name;
        return searchStr.toLowerCase().includes(input.toLowerCase());
      }
    );
    if (result.length !== 0)
      return result.map((cmp: { Symbol: string; Name: string }) => {
        return cmp.Symbol + ": " + cmp.Name;
      });
    return [];
  }

  async handleSubmit(result: string) {
    /*
    // @ts-ignore
    const res = result || this.$refs.searchInput.value;
    const cmp: Company | undefined = this.$store.getters.allCompanies.find(
      (el: Company) => el.companyName == res
    );
    if (cmp !== undefined) {
      this.$router
        .push({ path: `/Companies/Company/${cmp.companyID}` })
        .catch((err) => {});
    }
    */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
header {
  box-sizing: border-box;
  background: black;
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: white;
  margin: 0;
  font-size: 20px;
}
</style>
