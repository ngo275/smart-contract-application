// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './store/'
import 'font-awesome/css/font-awesome.css'
import 'vuetify/dist/vuetify.min.css'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.min.css'
import Vuetify from 'vuetify'
import VModal from 'vue-js-modal'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'

Vue.config.productionTip = false
Vue.use(Vuetify)
Vue.use(VModal)
Vue.component('vue-ctk-date-time-picker', VueCtkDateTimePicker)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
