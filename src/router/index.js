import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Tool",
    component: () => import("../views/ToolPage.vue")
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/AboutPage.vue")
  },
  {
    path: "/help",
    name: "Help",
    component: () => import("../views/HelpPage.vue")
  },
  {
    path: "*",
    component: () => import("../views/NotFoundPage")
  }
];

const router = new VueRouter({
  routes
});

export default router;
