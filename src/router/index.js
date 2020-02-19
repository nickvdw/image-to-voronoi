import Vue from "vue";
import VueRouter from "vue-router";
import App from "../App.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: App
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue")
  },
  {
    path: "/help",
    name: "Help",
    component: () => import("../views/Help.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
