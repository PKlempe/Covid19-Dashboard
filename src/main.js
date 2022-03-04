import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import store from './store/store';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

// Color palette has been taken from: https://www.schemecolor.com/in-the-fast-lane.php
Vue.prototype.$colors = ["#1192D7", "#45DD5B", "#FDB243",
                         "#ECE4AE", "#E34563", "#515151"];

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');