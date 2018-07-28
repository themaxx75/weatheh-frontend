<template>
  <v-app id="weatheh">
    <v-toolbar app absolute clipped-left>
      <a href="/">
        <img src="./../assets/logo_named.svg" alt="Weatheh.com logo" height="35">
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <!--<v-text-field-->
        <!--solo-inverted-->
        <!--flat-->
        <!--hide-details-->
        <!--label="Search city"-->
        <!--prepend-inner-icon="search"-->
        <!--disabled-->
      <!--&gt;</v-text-field>-->

      <!--<v-autocomplete-->
        <!--:loading="loading"-->
        <!--:items="items"-->
        <!--:search-input.sync="search"-->
        <!--v-model="select"-->
        <!--cache-items-->
        <!--class="mx-3"-->
        <!--flat-->
        <!--hide-no-data-->
        <!--hide-details-->
        <!--label="Search for a city"-->
        <!--solo-inverted-->
      <!--&gt;</v-autocomplete>-->
      <v-autocomplete
        v-model="state"
        label="Search cities"
        :items="states"
        @input.native="getSearchResults"
        @change="getForecastForCity(state)"
        item-text="nameEn"
        item-value="id"
        :no-filter="true"
        :loading="isSearching"
        solo
        flat
        hide-details
        :clearable="true"
      ></v-autocomplete>
      <v-btn
        @click="setLanguage"
        outline
        small
        fab
      >
        {{ language }}
      </v-btn>
      <v-btn
        @click="getUserLocation"
        outline
        small
        fab
        icon
      >
        <v-icon>my_location</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content fluid>
      <!-- Only visible when forecastResults is null -->
      <v-container v-if="forecastResults === null" fluid fill-height class="grey lighten-4">
        <v-jumbotron>
          <v-container fill-height>
            <v-layout align-center>
              <v-flex align-center>
                <h3 class="display-3" >
                  <img src="./../assets/logo.svg" height="50"/>
                  Canadian weather forecast
                </h3>
                <span class="subheading">
                  All data from Environment and Climate Change Canada public API. Site made for fun and should not be used where accurate data is important to your safety.
                </span>
                <!--<v-divider class="my-3"></v-divider>-->
              </v-flex>
            </v-layout>
          </v-container>
        </v-jumbotron>
      </v-container>

      <!-- Loader -->
      <v-layout row>
        <v-dialog v-model="isLoadingFullScreen" persistent fullscreen content-class="loading-dialog" transition="slide-y-transition">
          <v-container fill-height>
            <v-layout row justify-center align-center>
              <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
            </v-layout>
          </v-container>
        </v-dialog>
      </v-layout>

      <!-- Dialog when not able to get geo location -->
      <v-layout row justify-center>
        <v-dialog v-model="showLocationWarning" max-width="290">
          <v-card>
            <v-card-title class="headline">
              Error obtaining your geo location.
            </v-card-title>
            <v-card-text>
              This can happen if you refuse to allow access to your geo location.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                flat="flat"
                @click="showLocationWarning = false"
              >
                Ok
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>

    </v-content>

    <!-- Now in city -->
    <v-jumbotron v-if="forecastResults !== null">
      <v-container>
        <v-layout align-center>
          <v-flex text-xs-center>
            <div class="display-2">{{ forecastResults.station.city }}</div>
            <div>
              {{ forecastResults.city.nameEn }}
            </div>
            <br/>
            <div class="display-4 font-weight-thin">
              <i :class="forecastResults.current.iconClass"></i>
              {{ forecastResults.current.temperature }}&deg;C
            </div>
            <br/>
            <div class="display-1">
              {{ forecastResults.current.description }}
            </div>
            <br/>
            <div>
              <v-chip label outline color="black" small disabled>Humidex: {{ forecastResults.current.humidex }}</v-chip>
              <v-chip label outline color="black" small disabled>Humidity: {{ forecastResults.current.relativeHumidity }}%</v-chip>
              <v-chip label outline color="black" small disabled>Wind: {{ forecastResults.current.windDirection }} {{ forecastResults.current.windSpeed }}Km</v-chip>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>

    <!-- Results for short term -->
    <v-content v-if="forecastResults !== null" fluid>
      <!--<v-layout justify-center align-center>-->
        <!--<h1>Short term</h1>-->
      <!--</v-layout>-->
      <v-layout>
        <v-flex>
          <v-card flat class="grey lighten-5">
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex xs12 md6 lg3 v-for="forecast in forecastResults.foreCast.slice(0, 4)" v-bind:key="forecast.id">
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
  name: 'Home',
  data () {
    return {
      language: 'en',
      city: null,
      userPosition: null,
      forecastResults: null,
      isLoadingFullScreen: false,
      isSearching: false,
      showWelcome: true,
      showLocationWarning: false,
      state: null,
      states: []
    }
  },

  methods: {
    getLanguage () {
      let lang = this.$cookie.get('lang')
      if (lang == null) {
        this.$cookie.set('lang', 'en', 30)
      } else {
        this.language = lang
      }
    },

    setLanguage () {
      if (this.language === 'en') {
        this.language = 'fr'
        this.$cookie.set('lang', 'fr', 30)
      } else {
        this.language = 'en'
        this.$cookie.set('lang', 'en', 30)
      }
      if (this.city) {
        this.getForecastForCity(this.city)
      }
    },

    handleLocationError () {
      this.isLoadingFullScreen = false
      this.showLocationWarning = true
    },

    getForecastFromLocation (position) {
      this.showWelcome = false
      const path = process.env.VUE_APP_BASE_URI + `/forecast/coordinates/`
      axios.get(path,
        {
          params: {
            'lat': position.coords.latitude.toFixed(4),
            'lon': position.coords.longitude.toFixed(4),
            'lang': this.language
          }
        }
      )
        .then(response => {
          this.forecastResults = response.data
          this.city = this.forecastResults.city.id
        })
        .catch(error => {
          console.log(error)
        })
      this.isLoadingFullScreen = false
    },

    getUserLocation () {
      if (navigator.geolocation) {
        this.isLoadingFullScreen = true
        navigator.geolocation.getCurrentPosition(this.getForecastFromLocation, this.handleLocationError)
      }
    },

    getSearchResults (term) {
      if (term.target.value !== null) {
        this.isSearching = true
        const path = process.env.VUE_APP_BASE_URI + `/forecast/search/` + term.target.value
        axios.get(path, {
          params: {'lang': this.language}
        })
          .then(response => {
            this.states = response.data
            this.isSearching = false
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        this.states = []
      }
    },

    getForecastForCity (cityCode) {
      if (cityCode) {
        const path = process.env.VUE_APP_BASE_URI + `/forecast/city/` + cityCode
        axios.get(path, {
          params: {'lang': this.language}
        })
          .then(response => {
            this.forecastResults = response.data
            this.city = this.forecastResults.city.id
          })
          .catch(error => {
            console.log(error)
          })
      }
    }
  },

  beforeMount () {
    this.getLanguage()
  }
}
</script>
