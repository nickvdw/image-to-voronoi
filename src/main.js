import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import vuetify from "./plugins/vuetify";
import "./registerServiceWorker";
import VueHtml2Canvas from "vue-html2canvas";

Vue.use(VueHtml2Canvas);

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
