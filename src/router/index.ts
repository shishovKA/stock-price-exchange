import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Portfolio from "../views/Portfolio.vue";
import Company from "../views/Company.vue";

import store from "../store/index";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  { path: "/", redirect: "/dashboard" },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/company/:symbol",
    name: "company",
    component: Company,
    beforeEnter: (to, from, next) => {
      if (!store.getters.companyInfo) {
        next({ path: "/" });
      } else {
        next();
      }
    },
  },
  {
    path: "/portfolio",
    name: "portfolio",
    component: Portfolio,
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

export default router;
