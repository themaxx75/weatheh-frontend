<template>
  <v-app id="inspire">
    <v-toolbar app absolute clipped-left>
      <a href="/">
        <img src="./../assets/logo_named.svg" alt="Weatheh.com logo" height="50">
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Search city"
        prepend-inner-icon="search"
      ></v-text-field>
      <v-btn small fab ripple @click="getUserLocation">
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content fluid>
      <!-- Only visible when forecastResponse is null -->
      <v-container v-if="forecastResponse === null" fluid fill-height class="grey lighten-4">
        <v-jumbotron>
          <v-container fill-height>
            <v-layout align-center>
              <v-flex>
                <h3 class="display-3">Canadian weather forecast</h3>
                <span class="subheading">
                  All data from Environment and Climate Change Canada.
                </span>
                <!--<v-divider class="my-3"></v-divider>-->
              </v-flex>
            </v-layout>
          </v-container>
        </v-jumbotron>
      </v-container>

      <!-- Loader -->
      <v-layout row>
        <v-dialog v-model="isLoading" persistent fullscreen content-class="loading-dialog" transition="slide-y-transition">
          <v-container fill-height>
            <v-layout row justify-center align-center>
              <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
            </v-layout>
          </v-container>
        </v-dialog>
      </v-layout>
    </v-content>

    <!-- Now in city -->
    <v-jumbotron v-if="forecastResponse !== null">
      <v-container fill-height>
        <v-layout align-center>
          <v-flex text-xs-center>
            <div class="display-1">Now in {{ forecastResponse.station.city }} <br/> (near {{ forecastResponse.city.nameEn }})</div>
            <div class="display-4 font-weight-thin">
              <i :class="forecastResponse.current.iconClass"></i>
              {{ forecastResponse.current.temperature }}&deg;C
            </div>
            <div class="display-1">
              {{ forecastResponse.current.description }}
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>

    <!-- Results for short term -->
    <v-content v-if="forecastResponse !== null" fluid>
      <v-layout justify-center align-center>
        <h1>Short term</h1>
      </v-layout>
      <v-layout>
        <v-flex>
          <v-card flat class="grey lighten-5">
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md6 lg3 v-for="forecast in forecastResponse.foreCast.slice(0, 4)" v-bind:key="forecast.id">
                  <v-card tile raised height="290">
                    <v-card-title>
                      <div class="display-1">{{ forecast.forecastPeriod }}</div>
                    </v-card-title>
                    <v-card-title>
                      <div class="display-3 font-weight-thin">
                        <i :class="forecast.iconClass" ></i>
                        {{ forecast.temperature }}&deg;C
                      </div>
                    </v-card-title>
                    <v-card-title>
                      <div >{{ forecast.cloudPrecipitation }}</div>
                    </v-card-title>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'
export default {
  name: 'GoogleKeep',
  data () {
    return {
      userPosition: null,
      forecastResponse: null,
      isLoading: false,
      showWelcome: true,
      forecastRsp: null,
      firstIteration: false
    }
  },
  methods: {
    getUserLocation () {
      this.showWelcome = false
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
