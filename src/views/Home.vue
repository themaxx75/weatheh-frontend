<template>
  <v-app id="weatheh">
    <!--absolute-->
    <v-toolbar
      app
      clipped-left
      :prominent="true"
    >
      <a href="/">
        <!--suppress CheckImageSize -->
        <img src="./../assets/logo_named.svg" alt="Weatheh.com logo" height="35">
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
        solo
        flat
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
            {{ item.province.code }}
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.name"></v-list-tile-title>
            <v-list-tile-sub-title v-text="item.region"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-avatar>
            <v-chip
              color="grey darken-3"
              text-color="white"
              v-if="item.condition.temperature"
            >
              <i :class="item.condition.iconClass" ></i>{{ item.condition.temperature }}&deg;C
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
      <v-container v-if="forecastResults === null" fluid fill-height class="grey lighten-4">
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

      <!-- Loader -->
      <v-layout row>
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
      </v-layout>

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
    <v-jumbotron
      v-if="forecastResults !== null"
      height="100%"
    >
      <v-container>
        <v-layout align-center>
          <v-flex text-xs-center>
            <div class="display-2">{{ forecastResults.station.city }}</div>
            <div class="display-1">{{ forecastResults.city.province.name }}</div>
            <div
              v-if="forecastResults.city && forecastResults.city.name !== forecastResults.station.city"
            >
              {{ forecastResults.city.name }}
            </div>
            <div v-else>
              <br>
            </div>
            <br/>
            <div v-if="forecastResults.current.temperature" class="display-4 font-weight-thin">
              <i :class="forecastResults.current.iconClass"></i>
              {{ forecastResults.current.temperature }}&deg;C
            </div>
            <br/>
            <div v-if="forecastResults.current.description" class="display-1">
              {{ forecastResults.current.description }}
            </div>
            <br/>
            <div>
              <v-chip
                v-if="forecastResults.current.humidex"
                label
                outline
                color="black"
                small
                disabled
              >
                {{ $t("message.terms.humidex") }}: {{ forecastResults.current.humidex }}
              </v-chip>
              <v-chip
                v-if="forecastResults.current.relativeHumidity"
                label
                outline
                color="black"
                small
                disabled
              >
                {{ $t("message.terms.humidity") }}: {{ forecastResults.current.relativeHumidity }}%
              </v-chip>
              <v-chip
                v-if="forecastResults.current.windDirection"
                label
                outline
                color="black"
                small
                disabled
              >
                {{ $t("message.terms.wind") }}: {{ forecastResults.current.windDirection }} {{ forecastResults.current.windSpeed }}Km
              </v-chip>
            </div>
            <div v-if="forecastResults.observationDatetimeUtc">
              {{ $t("message.terms.observed") }}: {{ fromUtcToLocal(forecastResults.observationDatetimeUtc) }}
            </div>

          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>

    <!-- Results for short term -->
    <v-content v-if="forecastResults !== null" fluid>
      <v-layout>
        <v-flex>
          <v-card flat class="grey lighten-5">
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex
                  xs12
                  md6
                  lg3
                  v-for="forecast in forecastResults.foreCast.slice(0, 4)"
                  v-bind:key="forecast.id"
                >
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
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <v-bottom-nav
      absolute
      :fixed="false"
      :value="true"
    >
      <v-dialog width="70%">
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
      if (this.city) {
        this.getForecastForCity(this.city)
      }
    },

    handleLocationError () {
      this.isLoadingFullScreen = false
      this.showLocationWarning = true
    },

    getForecastFromLocation (position) {
      this.states = []
      this.showWelcome = false
      this.$vuetify.goTo(0)
      const path = process.env.VUE_APP_BASE_URI + `/forecast/coordinates/`
      axios.get(path,
        {
          params: {
            'lat': position.coords.latitude.toFixed(4),
            'lon': position.coords.longitude.toFixed(4),
            'lang': this.$i18n.locale
          }
        }
      )
        .then(response => {
          this.forecastResults = response.data
          this.city = this.forecastResults.city.id
          this.$cookie.set('city', this.city, 30)
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
      if (term.target.value.length > 1) {
        this.isSearching = true
        const path = process.env.VUE_APP_BASE_URI + `/forecast/search/` + term.target.value
        axios.get(path, {
          params: {'lang': this.$i18n.locale}
        })
          .then(response => {
            this.states = response.data
          })
          .catch(error => {
            console.log(error)
          })
        this.isSearching = false
      } else {
        this.states = []
      }
    },

    getForecastForCity (cityCode) {
      if (cityCode) {
        this.$vuetify.goTo(0)
        this.isLoadingFullScreen = true
        const path = process.env.VUE_APP_BASE_URI + `/forecast/city/` + cityCode
        axios.get(path, {
          params: {'lang': this.$i18n.locale}
        })
          .then(response => {
            this.forecastResults = response.data
            this.city = this.forecastResults.city.id
            this.$cookie.set('city', this.city, 30)
          })
          .catch(error => {
            console.log(error)
          })
        this.isLoadingFullScreen = false
      }
    },

    getPreviousCity () {
      const city = this.$cookie.get('city')
      if (city || this.forecastResults == null) {
        this.getForecastForCity(city)
      }
    }
  },

  beforeMount () {
    this.getLanguage()
    this.getPreviousCity()
  }
}
</script>
