import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import router from './router';
import store from './store';
import axios from 'axios';
import VueAxios from 'vue-axios';

import VueNotification from '@kugatsu/vuenotification';

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.use(VueAxios, axios);

Vue.config.productionTip = false;
Vue.use(Vuex);

Vue.use(VueNotification, {
  timer: 15,
  showCloseIcn: true,
  position: 'bottomRight',
  error: {
    background: 'var(--color-red)',
    color: 'var(--color-white)',
  },
  success: {
    background: 'var(--color-green)',
    color: 'var(--color-white)',
  },
});

Vue.use(Loading, {
  canCancel: false,
  onCancel: this.onCancel,
  color: 'var(--color-primary)',
  backgroundColor: 'var(--color-black)',
});

export default new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
