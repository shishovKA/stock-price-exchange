<template>
  <header>
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
import { Component, Vue, Ref } from "vue-property-decorator";
// @ts-ignore
import Autocomplete from "@trevoreyre/autocomplete-vue";

@Component({
  components: {
    Autocomplete,
  },
})
export default class Header extends Vue {
  @Ref() searchInput!: any;

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
    if (!result) return;
    const symbol = result.slice(0, result.indexOf(":"));
    this.$store.dispatch("addCompanyToList", symbol).finally(() => {
      this.searchInput.value = "";
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
header {
  height: 72px;
  background-color: #1e1c1c;
  width: 100%;
  padding: 1.6rem 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search {
  flex: 0 1 450px;
}
</style>

<style lang="less">
.autocomplete-input {
  color: #edeff1;
  border: 1px solid #edeff1;
  border-radius: 20px;
  width: 100%;
  height: 40px;
  padding: 12px 12px 12px 48px;
  box-sizing: border-box;
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  flex: 1;
  background-color: #1e1c1c;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxwYXRoIGQ9Ik0yMSAyMWwtNC00Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: 12px;
}

.autocomplete-input:focus,
.autocomplete-input[aria-expanded="true"] {
  outline: none;
}

[data-position="below"] .autocomplete-input[aria-expanded="true"] {
  border-bottom-color: transparent;
  border-radius: 20px 20px 0 0;
}

[data-position="above"] .autocomplete-input[aria-expanded="true"] {
  border-top-color: transparent;
  border-radius: 0 0 8px 8px;
  z-index: 2;
}

.autocomplete[data-loading="true"]:after {
  content: "";
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-right-color: rgba(0, 0, 0, 0.48);
  border-radius: 100%;
  width: 20px;
  height: 20px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  animation: rotate 1s linear infinite;
}

.autocomplete-result-list {
  margin: 0;
  border: 1px solid #edeff1;
  padding: 0;
  box-sizing: border-box;
  max-height: 296px;
  overflow-y: auto;
  background: #1e1c1c;
  list-style: none;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.16);
}

[data-position="below"] .autocomplete-result-list {
  margin-top: -1px;
  border-top-color: transparent;
  border-radius: 0 0 8px 8px;
  padding-bottom: 8px;
}

[data-position="above"] .autocomplete-result-list {
  margin-bottom: -1px;
  border-bottom-color: transparent;
  border-radius: 8px 8px 0 0;
  padding-top: 8px;
}

.autocomplete-result {
  cursor: default;
  padding: 12px 12px 12px 48px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxwYXRoIGQ9Ik0yMSAyMWwtNC00Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: 12px;
}

.autocomplete-result:hover,
.autocomplete-result[aria-selected="true"] {
  background-color: rgba(255, 255, 255, 0.1);
}

@keyframes rotate {
  0% {
    transform: translateY(-50%) rotate(0deg);
  }

  to {
    transform: translateY(-50%) rotate(359deg);
  }
}
</style>
