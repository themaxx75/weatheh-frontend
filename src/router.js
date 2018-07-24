import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import GoogleKeep from './views/GoogleKeep.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/keep/',
      'name': 'keep',
      component: GoogleKeep
    }
  ]
})
