/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import store from "../index";
import { storedList } from "../../static-data/symbol-list";
import { VuexModule, Module, Action, Mutation } from "vuex-module-decorators";

@Module
class CompaniesList extends VuexModule {
  symbolList: { Symbol: string; Name: string }[] = storedList;
  table: any[] = [];

  @Action
  fetchCompanyQuote(symbol: string) {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch(
      `https://app-b96e2a39-7c83-44b5-b229-27d361327094.cleverapps.io/quote/${symbol}`,
      // @ts-ignore
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        store.commit("appendTable", result.price);
      })
      .catch((error) => console.log("error", error));
  }

  @Mutation
  public appendTable(data: any) {
    this.table.splice(this.table.length, 0, data);
    console.log(this.table);
  }

  get companiesSymbolList(): { Symbol: string; Name: string }[] {
    return this.symbolList;
  }

  get stocksTable(): any[] {
    return this.table;
  }
}
export default CompaniesList;
