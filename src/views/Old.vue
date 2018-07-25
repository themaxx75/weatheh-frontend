<template>
  <div class="section">
    <router-link to="/keep">Go to keep</router-link>
    <!--<div class="columns is-mobile">-->
    <!--<div class="column is-half is-offset-one-quarter">-->
    <form class="is-centered is-fullwidth">
      <div class="field has-addons">
        <div id="searchEl" v-bind:class="{ 'is-loading': isLoading }" class="control is-large is-fullwidth">
          <!--<div id="searchEl" v-bind:class="{ 'forecastResponse !== null': isLoading }" class="control is-large is-fullwidth">-->
          <input id="searchCity" class="input is-large is-expanded" type="text" placeholder="Search">
        </div>
        <div class="control is-large">
          <div class="field has-addons">
            <p class="control">
              <a class="button is-large">
                <span class="icon">
                  <font-awesome-icon icon="search"></font-awesome-icon>
                </span>
                <span>Search</span>
              </a>
            </p>
            <p class="control">
              <a @click="getUserLocation" class="button is-large">
                <span class="icon">
                  <font-awesome-icon icon="crosshairs"></font-awesome-icon>
                </span>
                <span>Locate</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </form>
    <!--</div>-->
    <!--</div>-->
    <div v-if="forecastResponse !== null">
      <br/>
      <div class="columns is-centered">
        <div class="column">
          First column
        </div>
        <div class="column">
          Second column
        </div>
      </div>

      <div class="columns is-centered">
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title is-centered">
                Now
              </p>
            </header>
            <div class="card-header-title is-centered">
              <i :class="forecastResponse.current.iconClass" class="huge-icon"></i>
            </div>
            <div class="card-content">
              <p class="title is-3">{{ forecastResponse.current.temperatureDisplay }}&deg;C</p>
              <p class="subtitle is-6">{{ forecastResponse.current.description }}</p>
            </div>
          </div>
        </div>

        <div v-for="forecast in forecastResponse.foreCast.slice(0, 3)" v-bind:key="forecast.id" class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title is-centered">
                {{ forecast.forecastPeriod }}
              </p>
            </header>
            <div class="card-header-title is-centered">
              <i :class="forecast.iconClass" class="huge-icon"></i>
            </div>
            <div class="card-content">
              <p class="title is-3">{{ forecast.temperature }}&deg;C</p>
              <p class="subtitle is-6">{{ forecast.cloudPrecipitation }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-for="hourly in forecastResponse.hourly" v-bind:key="hourly.id" class="columns is-mobile">
        <div class="column">
          {{ hourly.forLocalHour }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data () {
    return {
      userPosition: null,
      forecastResponse: null,
      isLoading: false,
      forecastRsp: null
    }
  },
  methods: {
    getForecastFromLocation () {
      this.isLoading = true
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.userPosition = position.coords
          this.userLat = position.coords.latitude.toFixed(4)
          this.userlon = position.coords.longitude.toFixed(4)
          const path = process.env.VUE_APP_BASE_URI + `/forecast/coordinates/`
          axios.get(path,
            {
              params: {
                'lat': this.userPosition.latitude,
                'lon': this.userPosition.longitude
              }
            }
          )
            .then(response => {
              this.forecastResponse = response.data
            })
            .catch(error => {
              console.log(error)
            })
          this.isLoading = false
        })
      } else {
        this.userPosition = null
      }
    }
  }
}
</script>
