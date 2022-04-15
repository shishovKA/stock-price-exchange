import Vue from "vue";
import Vuex from "vuex";

import CompaniesList from "./modules/companies-list";
import CompanyDetails from "./modules/company-details";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    CompaniesList,
    CompanyDetails,
  },
});
