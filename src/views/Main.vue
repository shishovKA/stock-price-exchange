<template>
  <div class="home">
    тут будит все
    <p v-for="company in symbolList" :key="company.Symbol">
      <span style="font-weight: bold">{{ company.Symbol }} </span>
      <span>{{ company.Name }}</span>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class HomeView extends Vue {
  mounted() {
    console.log("stored " + this.symbolList.length + " symbols");
  }

  get symbolList() {
    return this.$store.getters.companiesSymbolList;
  }
}
</script>
