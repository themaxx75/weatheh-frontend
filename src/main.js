import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'

// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faSpinner } from '@fortawesome/fontawesome-free-solid'
// import { faGithub } from '@fortawesome/free-brands-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import './assets/css/fontello.css'
import './assets/css/weatheh.css'

import VueCookie from 'vue-cookie'
import VueI18n from 'vue-i18n'

// library.add(faSpinner)

Vue.use(VueCookie)
Vue.use(VueI18n)
// Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

const messages = {
  en: {
    message: {
      placeHolder: {
        title: 'Canadian weather forecast',
        body: 'All data from Environment and Climate Change Canada public API. Site made for fun and should not be used where accurate data is important to your safety.',
        description: 'The site is made as a learning tool, so expect bugs and issues.'
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
        observed: 'Observed',
        at: 'at'
      },
      footer: {
        about: 'About',
        github: 'Visit on Github'
      }
    }
  },
  fr: {
    message: {
      placeHolder: {
        title: 'Prévisions météo canadienne',
        body: "Toute information issue de l'API publique d'Environnement et Changement climatique Canada. Le site est développer que pour le plaisir. Ne pas s'y fiez si votre sécurité en dépend.",
        description: "Le site sert d'outil d'apprentissage. Ne soyez pas surpris de rencontrer des bugs et problèmes."
      },
      searchPlaceHolder: 'Rechercher une ville',
      errors: {
        geoLocationTitle: "Erreur en essayant d'obtenir votre position.",
        geoLocationBody: "Ceci peut se produire si vous refuser l’accès à votre location, ou si la fonctionnalité n'est pas présente.",
        noResults: 'Aucun résultat'
      },
      terms: {
        humidex: 'Humidex',
        humidity: 'Humidité',
        wind: 'Vent',
        observed: 'Observé',
        at: 'a'
      },
      footer: {
        about: 'À propos',
        github: 'Visitez sur Github.'
      }
    }
  }
}
// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'en', // set locale
  messages // set locale messages
})

new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')
