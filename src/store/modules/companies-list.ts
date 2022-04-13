/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import store from "../index";
import { storedList } from "../../static-data/symbol-list";
import { VuexModule, Module, Action, Mutation } from "vuex-module-decorators";

const storage = window.localStorage;

@Module
class CompaniesList extends VuexModule {
  symbolList: { Symbol: string; Name: string }[] = storedList;
  table: any[] = [];

  @Action
  async fetchCompanyQuote(symbol: string) {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    return fetch(
      `https://app-b96e2a39-7c83-44b5-b229-27d361327094.cleverapps.io/quote/${symbol}`,
      // @ts-ignore
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        return result.price;
      })
      .catch((error) => console.log("error", error));
  }

  @Action
  addCompanyToList(symbol: string) {
    store.dispatch("fetchCompanyQuote", symbol).then((data) => {
      store.dispatch("appendStoragedList", symbol);
      store.commit("appendTable", data);
    });
  }

  @Mutation
  public appendTable(data: any) {
    const duplicateInd = this.table.findIndex(
      (el) => el.symbol === data.symbol
    );
    if (duplicateInd !== -1) {
      this.table.splice(duplicateInd, 1);
    }
    this.table.splice(0, 0, data);
  }

  get companiesSymbolList(): { Symbol: string; Name: string }[] {
    return this.symbolList;
  }

  get stocksTable(): any[] {
    return this.table;
  }

  @Action
  appendStoragedList(symbol: string) {
    const list: string[] = this.table.map((el) => el.symbol);
    const duplicateInd = list.findIndex((el) => el === symbol);
    if (duplicateInd !== -1) {
      list.splice(duplicateInd, 1);
    }
    list.splice(0, 0, symbol);
    storage.setItem("tracked_companies_list", JSON.stringify(list));
  }

  @Action loadStoragedList() {
    const storagedData = storage.getItem("tracked_companies_list");
    if (storagedData) {
      const symbolList = JSON.parse(storagedData);
      const promises = symbolList.map((symbol: string) => {
        return store.dispatch("fetchCompanyQuote", symbol);
      });
      Promise.allSettled(promises).then((results) => {
        console.log(results);
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            store.commit("appendTable", result.value);
          }
        });
      });
    }
    console.warn("tracked_companies_list is empty");
  }

  /*
  @Action loadViewedList() {
    const storagedList = storage.getItem('viewedList');
    if (storagedList) {
      store.commit('setViewedList', JSON.parse(storagedList));
    }
  }

  @Mutation setViewedList(list: viewedCompanyInfo[]) {
    this.viewedList.splice(0, this.viewedList.length, ...list);
  }

  */
}
export default CompaniesList;
