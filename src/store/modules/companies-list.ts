import store from "../index";
import { storedList } from "../../static-data/symbol-list";
import { VuexModule, Module } from "vuex-module-decorators";

@Module
class CompaniesList extends VuexModule {
  symbolList: { Symbol: string; Name: string }[] = storedList;

  /*
  @Action
  loadSessionUserName() {
    const username: string = window.CbhRosie.getUserName();
    store.commit('setUserName', username);
  }

  @Mutation
  public setUserName(username: string) {
    this.sessionUsername = username;
  }
  */

  get companiesSymbolList(): { Symbol: string; Name: string }[] {
    return this.symbolList;
  }
}
export default CompaniesList;
