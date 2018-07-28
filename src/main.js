import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/fontawesome-free-solid'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import './assets/css/fontello.css'
import './assets/css/weatheh.css'

import VueCookie from 'vue-cookie'
import VueI18n from 'vue-i18n'

library.add(faSpinner)
Vue.use(VueCookie)
Vue.use(VueI18n)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

const messages = {
  en: {
    message: {
      placeHolder: {
        title: 'Canadian weather forecast',
        body: 'All data from Environment and Climate Change Canada public API. Site made for fun and should not be used where accurate data is important to your safety.'
      },
      searchPlaceHolder: 'Search cities',
      errors: {
        geoLocationTitle: 'Error obtaining your geo location.',
        geoLocationBody: 'This can happen if you refuse to allow access to your geo location.',
        noResults: 'No results'
      },
      terms: {
        humidex: 'Humidex',
        humidity: 'Humidity',
        wind: 'Wind',
        observed: 'Observed'
      }
    }
  },
  fr: {
    message: {
      placeHolder: {
        title: 'Prévisions météo canadianne',
        body: "Toute information issue d'Environnement et Changement climatique Canada. Le site a été fais que pour le plaisire. Ne pas s'y fiez si votre sécurité en depand."
      },
      searchPlaceHolder: 'Recherez une ville',
      errors: {
        geoLocationTitle: "Erreure en essayant d'obtenir votre position.",
        geoLocationBody: "'Ceci peu se produire l'ors que vous avez refuser l'access a votre location, ou si la fonctionalite n'est pas presente.",
        noResults: 'Aucun resultat'
      },
      terms: {
        humidex: 'Humidex',
        humidity: 'Humiditée',
        wind: 'Vent',
        observed: 'Observé'
      }
    }
  }
}
// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'fr', // set locale
  messages // set locale messages
})

new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')
