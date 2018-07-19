import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/fontawesome-free-solid'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import './assets/css/fontello.css'
import './assets/css/bulma.css'
import './assets/css/weatheh.css'

// library.add(faCoffee)
library.add(faSpinner)

Vue.component('font-awesome-icon', FontAwesomeIcon)

function getMyName () {
  return 'Maxime'
}






Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  getMyName: getMyName
}).$mount('#app')
