<template>
  <v-app id="weatheh">
    <v-toolbar
      app
      color="white"
      clipped-left
      :prominent="false"
    >
      <a href="/">
        <!--suppress CheckImageSize -->
        <img src="./../assets/logo_named.svg" alt="Weatheh.com logo" height="35" width="35">
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <v-autocomplete
        id="search"
        v-model="state"
        :label="$t('message.searchPlaceHolder')"
        :items="states"
        @input.native="getSearchResults"
        @change="getForecastForCity(state)"
        item-text="name"
        item-value="id"
        :no-filter="true"
        :loading="isSearching"
        hide-details
        hide-no-data
        :clearable="true"
      >
        <template slot="no-data">
          <v-list-tile>
            <v-list-tile-title>
              {{ $t("message.errors.noResults") }}
            </v-list-tile-title>
          </v-list-tile>
        </template>
        <template
          slot="item"
          slot-scope="{ item, tile }"
        >
          <v-list-tile-avatar
            color="grey darken-3"
            class="headline font-weight-light white--text"
          >
            {{ item['province'] }}
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-text="item['name']"></v-list-tile-title>
            <v-list-tile-sub-title v-text="item['parentName']"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-avatar>
            <v-chip
              color="grey darken-3"
              text-color="white"
              v-if="item['weather']['current']['temperature']"
            >
              <i :class="item['weather']['current']['iconClass']" ></i>{{ item['weather']['current']['temperature'] }}&deg;C
            </v-chip>
          </v-list-tile-avatar>
          &nbsp;
        </template>
      </v-autocomplete>
      <v-btn
        @click="setLanguage"
        outline
        small
        fab
      >
        <div v-if="this.$i18n.locale === 'en'">FR</div>
        <div v-else>EN</div>
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
      <template v-if="forecastResults === null">
        <v-container fluid fill-height class="grey lighten-4">
          <v-jumbotron>
            <v-container fill-height>
              <v-layout align-center>
                <v-flex align-center>
                  <h4 class="display-1" >
                    <!--suppress CheckImageSize -->
                    <img src="./../assets/logo.svg" height="50"/>
                    Weatheh<br/>
                    {{ $t("message.placeHolder.title") }}
                  </h4>
                  <span class="subheading">
                    {{ $t("message.placeHolder.body") }}
                  </span>
                  <!--<v-divider class="my-3"></v-divider>-->
                </v-flex>
              </v-layout>
            </v-container>
          </v-jumbotron>
        </v-container>
      </template>

      <!-- Loader -->
      <v-dialog
        v-model="isLoadingFullScreen"
        persistent
        fullscreen
        content-class="loading-dialog"
        transition="slide-y-transition"
      >
        <v-container fill-height>
          <v-layout row justify-center align-center>
            <v-progress-circular
              indeterminate
              :size="70"
              :width="7"
              color="black"
            ></v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>

      <!-- Dialog when not able to get geo location -->
      <v-layout row justify-center>
        <v-dialog v-model="showLocationWarning" max-width="290">
          <v-card>
            <v-card-title class="headline">
              {{ $t("message.errors.geoLocationTitle") }}
            </v-card-title>
            <v-card-text>
              {{ $t("message.errors.geoLocationBody") }}
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
    <template v-if="forecastResults !== null">
      <div v-for="warning in forecastResults['weather']['warnings']" v-bind:key="warning['description']">
        <template v-if="warning['priority'] === 'urgent'">
          <v-alert
            :value="warning"
            color="error"
          >
            <div class="text-xs-center">
              <v-btn small :href="warning['url']" color="black" target="_blank" dark>
                <v-icon>warning</v-icon>&nbsp;
                {{ warning['description']}}
              </v-btn>
            </div>
          </v-alert>
        </template>
        <template v-else>
          <v-alert
            :value="warning"
            color="warning"
          >
            <div class="text-xs-center">
              <v-btn small :href="warning['url']" color="black" target="_blank" dark>
                <v-icon>warning</v-icon>&nbsp;
                {{ warning['description']}}
              </v-btn>
            </div>
          </v-alert>
        </template>
      </div>
      <v-jumbotron :height="null">
        <v-container>
          <v-layout align-center>
            <v-flex text-xs-center>
              <div class="display-2 font-weight-medium">{{ forecastResults['name'] }}</div>
              <div class="headline font-weight-thin">{{ forecastResults['provinceFull'] }}</div>
              <div v-if="forecastResults['weather']['current']['temperature']" class="display-4">
                <i :class="forecastResults['weather']['current']['iconClass']"></i>
                <span class="font-weight-thin">{{ forecastResults['weather']['current']['temperature'] }}&deg;C</span>
              </div>
              <div v-if="forecastResults['weather']['current']['description']" class="display-2 font-weight-light">
                {{ forecastResults['weather']['current']['description'] }}
              </div>
              <br/>
              <div>
                <v-chip
                  v-if="forecastResults['weather']['current']['humidex']"
                  label
                  outline
                  color="black"
                  small
                  disabled
                >
                  {{ $t("message.terms.humidex") }}: {{ forecastResults['weather']['current']['humidex'] }}
                </v-chip>
                <v-chip
                  v-if="forecastResults['weather']['current']['relativeHumidity']"
                  label
                  outline
                  color="black"
                  small
                  disabled
                >
                  {{ $t("message.terms.humidity") }}: {{ forecastResults['weather']['current']['relativeHumidity'] }}%
                </v-chip>
                <v-chip
                  v-if="forecastResults['weather']['current']['windDirection']"
                  label
                  outline
                  color="black"
                  small
                  disabled
                >
                  {{ $t("message.terms.wind") }}: {{ forecastResults['weather']['current']['windDirection'] }} {{ forecastResults['weather']['current']['windSpeed'] }}Km
                </v-chip>
              </div>
              <div v-if="forecastResults['weather']['observationDatetimeUtc']" class="caption">
                {{ $t("message.terms.observed") }}: {{ fromUtcToLocal(forecastResults['weather']['observationDatetimeUtc']) }} ({{ forecastResults['station'] }}, {{ forecastResults['parentName'] }})
              </div>
              <br/>
            </v-flex>
          </v-layout>

          <!-- Hourly -->
          <v-card flat class="grey lighten-5">
            <v-card-text class="overflow-hidden py-0">
              <v-layout row align-content-center class="horiz-scroll">
                <v-flex
                  v-for="hourly in forecastResults['weather']['hourly']"
                  :key="hourly['datetimeUtc']"
                  px-1
                  pb-2
                >
                  <div class="pos-relative">
                    <v-card-text height="133" width="133px" class="text-xs-center">
                      <i :class="hourly['iconClass']" class="display-2"></i>
                      <span class="subheading">
                        {{ hourly['temperature'] }}&deg;C
                      </span>
                      <span class="caption">
                        {{ fromUtcToLocal(hourly['datetimeUtc']) }}
                      </span>
                    </v-card-text>
                  </div>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <br/>
          <!-- Short and long term -->
          <template v-if="forecastResults !== null">
            <v-container fluid class="no-padding text-xs-center">

              <v-layout row wrap align-center>
                <v-flex>
                  <v-container fluid grid-list-md>
                    <div
                      v-for="forecast in forecastResults['weather']['shortTerm']"
                      v-bind:key="forecast.id"
                    >
                      <v-card tile raised dark>
                        <v-card-text>
                          <div class="display-1 font-weight-medium">{{ forecast['forecastPeriod'] }}</div>
                          <div class="display-3 font-weight-thin">
                            <i :class="forecast['iconClass']" ></i>
                            {{ forecast['temperature'] }}&deg;C
                          </div>
                          <div class="title font-weight-regular">
                            {{ forecast['summary'] }}
                          </div>
                        </v-card-text>
                      </v-card>
                      <br/>
                    </div>
                    <div
                      v-for="forecast in forecastResults['weather']['longTerm']"
                      v-bind:key="forecast.id"
                    >
                      <v-card tile raised dark>
                        <v-card-text>
                          <div class="display-1 font-weight-medium">{{ forecast['forecastPeriod'] }}</div>
                          <div class="display-3 font-weight-thin">
                            <i :class="forecast['iconClass']" ></i>
                            {{ forecast['temperature'] }}&deg;C
                          </div>
                          <div class="title font-weight-regular">
                            {{ forecast['cloudPrecipitation'] }}
                          </div>
                        </v-card-text>
                      </v-card>
                      <br/>
                    </div>

                  </v-container>
                </v-flex>
              </v-layout>
            </v-container>
          </template>
        </v-container>
      </v-jumbotron>
    </template>
    <br/>
    <v-bottom-nav
      absolute
      :fixed="false"
      :value="true"
    >
      <v-dialog width="500">
        <v-btn slot="activator">
          <span>{{ $t("message.footer.about") }}</span>
          <v-icon>info</v-icon>
        </v-btn>

        <v-card>
          <v-card-title>
            <!--suppress CheckImageSize -->
            <img src="./../assets/logo.svg" height="50"/>
            <h1>&nbsp;&nbsp;Weatheh</h1>
          </v-card-title>
          <v-card-title
            class="headline"
            primary-title
          >
            {{ $t("message.placeHolder.title") }}
          </v-card-title>

          <v-card-text>
            {{ $t("message.placeHolder.body") }}
          </v-card-text>
          <v-card-text>
            {{ $t("message.placeHolder.description") }}
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-btn href="https://github.com/themaxx75" target="_blank">
        <span>{{ $t("message.footer.github") }}</span>
        <v-icon>code</v-icon>
      </v-btn>

    </v-bottom-nav>
  </v-app>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'Home',
  data () {
    return {
      cityCode: null,
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
        this.$i18n.locale = 'en'
      } else {
        this.$i18n.locale = lang
      }
    },

    fromUtcToLocal (dt) {
      return moment(dt).format('HH[h]mm')
    },

    setLanguage () {
      if (this.$i18n.locale === 'en') {
        this.$i18n.locale = 'fr'
        this.$cookie.set('lang', 'fr', 30)
      } else {
        this.$i18n.locale = 'en'
        this.$cookie.set('lang', 'en', 30)
      }
      if (this.cityCode) {
        this.getForecastForCity(this.cityCode)
      }
    },

    handleLocationError () {
      this.isLoadingFullScreen = false
      this.showLocationWarning = true
    },

    getForecastFromLocation (position) {
      this.states = []
      this.showWelcome = false
      // noinspection JSIgnoredPromiseFromCall
      this.$vuetify.goTo(0)
      // noinspection JSUnresolvedVariable
      const path = process.env['VUE_APP_BASE_URI'] + `/forecast/coordinates/`
      axios.get(path,
        {
          params: {
            'lat': position.coords.latitude,
            'lon': position.coords.longitude,
            'lang': this.$i18n.locale
          }
        }
      )
        .then(response => {
          this.forecastResults = response.data
          this.cityCode = this.forecastResults['id']
          this.$cookie.set('city', this.forecastResults['id'], 30)
        })
        .catch(error => {
          console.log(error)
          this.cityCode = null
          this.$cookie.delete('city')
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
      if (term.target.value.length > 1) {
        this.isSearching = true
        // noinspection JSUnresolvedVariable
        const path = process.env['VUE_APP_BASE_URI'] + `/forecast/search/` + term.target.value
        axios.get(path, {
          params: {'lang': this.$i18n.locale}
        })
          .then(response => {
            this.states = response.data
            this.isSearching = false
          })
          .catch(error => {
            console.log(error)
            this.isSearching = false
          })
      } else {
        this.states = []
      }
    },

    getForecastForCity (cityCode) {
      console.log((cityCode))
      if (cityCode) {
        // noinspection JSIgnoredPromiseFromCall
        this.$vuetify.goTo(0)
        this.isLoadingFullScreen = true
        // noinspection JSUnresolvedVariable
        const path = process.env['VUE_APP_BASE_URI'] + `/forecast/city/` + cityCode
        // this.cityCode = null
        // this.$cookie.delete('city')
        axios.get(path, {
          params: {'lang': this.$i18n.locale}
        })
          .then(response => {
            this.forecastResults = response.data
            this.cityCode = this.forecastResults['id']
            this.$cookie.set('city', this.forecastResults['id'], 30)
          })
          .catch(error => {
            console.log(error)
            this.cityCode = null
            this.$cookie.delete('city')
          })
        this.isLoadingFullScreen = false
      }
    },

    getPreviousCity () {
      const city = this.$cookie.get('city')
      if (city || this.forecastResults == null) {
        // this.isLoadingFullScreen = true
        this.getForecastForCity(city)
        // this.isLoadingFullScreen = false
      }
    }
  },

  beforeMount () {
    this.forecastResults = null
    this.getLanguage()
    this.getPreviousCity()
  }
}
</script>
