/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import store from "../index";
import { VuexModule, Module, Action, Mutation } from "vuex-module-decorators";

@Module
class CompanyDetails extends VuexModule {
  currentCompany: any = null;
  historicalList: any[] = [];

  get companyInfo() {
    return this.currentCompany;
  }

  @Mutation
  public setCurrentCompany(symbol: string) {
    const find = store.getters.stocksTable.find((cmp: any) => {
      return cmp.symbol === symbol;
    });
    if (find) this.currentCompany = find;
    else {
      this.currentCompany = null;
    }
  }

  @Action
  public fetchCompanyHistoricalData(payload: any) {
    const { symbol, from, to } = payload;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("symbol", symbol);
    urlencoded.append("from", from);
    urlencoded.append("to", to);
    urlencoded.append("period", "d");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    return fetch(
      "https://app-b96e2a39-7c83-44b5-b229-27d361327094.cleverapps.io/historical",
      //@ts-ignore
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        store.commit("setHistoricalList", result);
      })
      .catch((error) => console.log("error", error));
  }

  @Mutation
  public setHistoricalList(list: any[]) {
    this.historicalList.splice(
      0,
      this.historicalList.length,
      ...list.reverse()
    );
    console.log("historicalList", this.historicalList);
  }

  get companyChartData() {
    return this.historicalList;
  }
}
export default CompanyDetails;
