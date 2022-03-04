<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-3" align="left">
        <h2>Location Stats</h2>
      </div>
      <div class="col-md-4">
        <div align="left">
          <div style="width:12em; float:left; margin-right:0.3em">
            <b-form-datepicker size="sm" :min="earliestDate" :max="latestDate" v-model="selectedTimeInterval[0]" :value-as-date="true" :date-format-options="{year:'numeric', month:'short', day:'numeric', weekday:'short'}"></b-form-datepicker>
          </div>
          <div style="width:12em; float:left">
            <b-form-datepicker size="sm" :min="earliestDate" :max="latestDate" v-model="selectedTimeInterval[1]" :value-as-date="true" :date-format-options="{year:'numeric', month:'short', day:'numeric', weekday:'short'}"></b-form-datepicker>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div align="left" style="float:left">
          <b-button size="sm" variant="success" v-on:click="++numOfAdditionalCharts" style="margin-right:0.3em">Add Graph</b-button>
          <b-button size="sm" variant="danger" v-on:click="numOfAdditionalCharts >= 1 ? --numOfAdditionalCharts : numOfAdditionalCharts = 0">Remove Graph</b-button>
        </div>
        <div align="right">
          <b-button-group size="sm">
            <b-button id="btnDailyData" :pressed="!isDataAccumulated" v-on:click="setDataAccumulation" variant="outline-primary">Daily Change</b-button>
            <b-button id="btnAccData" :pressed="isDataAccumulated" v-on:click="setDataAccumulation" variant="outline-primary">Accumulative</b-button>
          </b-button-group>
        </div>
      </div>
      <div class="col-md-2">
        <div align="right">
          <b-button-group size="sm">
            <b-button id="btnGraphMode" :pressed="graphMode" v-on:click="setVisMode" variant="outline-primary">Graph</b-button>
            <b-button id="btnMatrixMode" :pressed="!graphMode" v-on:click="setVisMode" variant="outline-primary">Matrix</b-button>
          </b-button-group>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-2" align="left">
        <b-form-input type="search" placeholder="Search location..." v-model="searchTerm"></b-form-input>
        <b-row align-v="center" align-h="center">
          <div style="float:left">Sort:</div>
          <div align="right" style="margin:8px">
            <b-dropdown size="sm" variant="primary"  v-bind:text="this.isListAscending ? 'Ascending' : 'Descending'">
              <b-dropdown-item id="optAscending" v-on:click="setListSorting">Ascending</b-dropdown-item>
              <b-dropdown-item id="optDescending" v-on:click="setListSorting">Descending</b-dropdown-item>
            </b-dropdown>
          </div>
        </b-row>
        <ul class="list-group list-group-flush">
          <label class="list-group-item" v-for="location in locationList" v-bind:key="location" v-on:mouseover="highlightLocation(location)">
            <input class="form-check-input me-1" type="checkbox" v-on:click="toggleSelectedLocation(location)">
            {{location}}
          </label>
        </ul>
      </div>
      <div class="col-md-8">
        <LocationLineChart v-bind:selectedTimeInterval="selectedTimeInterval" v-bind:selectedLocations="selectedLocations" 
                           v-bind:isDataAccumulated="isDataAccumulated" v-bind:randomIndexScale="randomIndexScale"
                           @highlightLocation="highlightLocation"/>
        <LocationLineChart v-for="i in numOfAdditionalCharts" v-bind:key="i"
                           v-bind:selectedTimeInterval="selectedTimeInterval" v-bind:selectedLocations="selectedLocations" 
                           v-bind:isDataAccumulated="isDataAccumulated" v-bind:randomIndexScale="randomIndexScale"
                           @highlightLocation="highlightLocation"/>
      </div>
      <div class="col-md-2" align="left" style="padding-left: 1.5em; padding-top: 0.5em; border-style:solid">
        <b-row align-h="center">
          <h5 id="locationName" style="text-align:center; font-weight:bold">No location selected</h5>
        </b-row>
        <b-row align-h="center" style="margin-top:0.5em">
          <h6 style="text-align:center; text-decoration:underline">Human Dev. Index</h6>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <h5 id="locationDevIndex" style="text-align:center">-</h5>
        </b-row>
        <b-row align-h="center" style="margin-top: 0.5em">
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">GDP</h6>
          </b-col>
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Extr. Poverty</h6>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <b-col>
            <h5 id="locationGDP" style="text-align:center">-</h5>
          </b-col>
          <b-col>
            <h5 id="locationPoverty" style="text-align:center">-</h5>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:1.0em">
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Hosp. beds</h6>
          </b-col>
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Handwash Fac.</h6>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <b-col>
            <h5 id="locationHospBeds" style="text-align:center">-</h5>
          </b-col>
          <b-col>
            <h5 id="locationHandwashFac" style="text-align:center">-</h5>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top: 1.5em">
          <h5 style="text-align:center">Population</h5>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <h5 id="locationPopulation" style="text-align:center">-</h5>
        </b-row>
        <b-row align-h="center" style="margin-top:0.5em">
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Median Age</h6>
          </b-col>
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Life Expect.</h6>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <b-col>
            <h5 id="locationMedianAge" style="text-align:center">-</h5>
          </b-col>
          <b-col>
            <h5 id="locationLifeExpect" style="text-align:center">-</h5>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:0.5em">
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Male Smokers</h6>
          </b-col>
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Fem. Smokers</h6>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <b-col>
            <h5 id="locationSmokersMale" style="text-align:center">-</h5>
          </b-col>
          <b-col>
            <h5 id="locationSmokersFemale" style="text-align:center">-</h5>
          </b-col>
        </b-row>

        <b-row align-h="center" style="margin-top:0.5em">
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Diabetes Preval.</h6>
          </b-col>
          <b-col>
            <h6 style="text-align:center; text-decoration:underline">Cardiov. Death Rate</h6>
          </b-col>
        </b-row>
        <b-row align-h="center" style="margin-top:-0.5em">
          <b-col>
            <h5 id="locationDiabetes" style="text-align:center">-</h5>
          </b-col>
          <b-col>
            <h5 id="locationCardiov" style="text-align:center">-</h5>
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import LocationLineChart from './LocationLineChart.vue';

export default {
  name: 'LocationStats',
  components: {
    LocationLineChart,
  },
  props: {
  },
  data() {
    return {
      graphMode: true,
      isDataAccumulated: false,
      selectedLocations: [],
      selectedTimeInterval: [undefined, undefined],
      searchTerm: "",
      isListAscending: true,
      numOfAdditionalCharts: 0,

      // Canvas
      svgWidth: 550,
      svgHeight: 550,
      svgPadding: {
        top: 75, right: 75, bottom: 75, left: 75
      },
      transitionSpeed: 200
    }
  },
  mounted() {
  },
  methods: {
    setDataAccumulation(event) {
      if(event.target.id == "btnAccData" && this.isDataAccumulated == false) {
        this.isDataAccumulated = true;
      }
      else if(event.target.id == "btnDailyData" && this.isDataAccumulated == true) {
        this.isDataAccumulated = false;
      }
    },
    setListSorting(event) {
      if(event.target.id == "optAscending" && !this.isListAscending) {
        this.isListAscending = true;
      }
      else if(event.target.id == "optDescending" && this.isListAscending) {
        this.isListAscending = false;
      }
    },
    setVisMode(event) {
      this.graphMode = event.target.id == "btnGraphMode" ? this.graphMode = true : this.graphMode = false;
    },
    initTimeInterval() {
      let previousWeek = new Date(this.latestDate);
      previousWeek.setDate(this.latestDate.getDate() - 7);

      this.selectedTimeInterval[0] = previousWeek;
      this.selectedTimeInterval[1] = this.latestDate;
    },
    toggleSelectedLocation(location) {
      const index = this.selectedLocations.indexOf(location);

      if(index == -1) {
        this.selectedLocations.push(location);
      }
      else {
        this.selectedLocations.splice(index, 1);
      }
    },
    highlightLocation(location) {
      let locationData = this.$store.getters.covidDataLocation(location);

      document.getElementById("locationName").textContent = location;
      document.getElementById("locationDevIndex").textContent = locationData["human_development_index"] == null ? "-" : locationData["human_development_index"].toLocaleString();
      document.getElementById("locationGDP").textContent = locationData["gdp_per_capita"] == null ? "-" : locationData["gdp_per_capita"].toLocaleString();
      document.getElementById("locationPoverty").textContent = locationData["extreme_poverty"] == null ? "-" : locationData["extreme_poverty"].toLocaleString() + " %";
      document.getElementById("locationHospBeds").textContent = locationData["hospital_beds_per_thousand"] == null ? "-" : locationData["hospital_beds_per_thousand"].toLocaleString();
      document.getElementById("locationHandwashFac").textContent = locationData["handwashing_facilities"] == null ? "-" : locationData["handwashing_facilities"].toLocaleString() + " %";
      document.getElementById("locationPopulation").textContent = locationData["population"] == null ? "-" : locationData["population"].toLocaleString();
      document.getElementById("locationMedianAge").textContent = locationData["median_age"] == null ? "-" : locationData["median_age"].toLocaleString() + " yrs";
      document.getElementById("locationLifeExpect").textContent = locationData["life_expectancy"] == null ? "-" : locationData["life_expectancy"].toLocaleString() + " yrs";
      document.getElementById("locationSmokersMale").textContent = locationData["male_smokers"] == null ? "-" : locationData["male_smokers"].toLocaleString() + " %";
      document.getElementById("locationSmokersFemale").textContent = locationData["female_smokers"] == null ? "-" : locationData["female_smokers"].toLocaleString() + " %";
      document.getElementById("locationDiabetes").textContent = locationData["diabetes_prevalence"] == null ? "-" : locationData["diabetes_prevalence"].toLocaleString() + " %";
      document.getElementById("locationCardiov").textContent = locationData["cardiovasc_death_rate"] == null ? "-" : locationData["cardiovasc_death_rate"];
    },
  },
  computed: {
    earliestDate: {
      get() {
        return this.$store.getters.earliestDate;
      }
    },
    latestDate: {
      get() {
        return this.$store.getters.latestDate;
      }
    },
    locationList() {
      let list = this.$store.getters.locationList;
      list = list.filter(location => location.toLowerCase().startsWith(this.searchTerm.toLowerCase()));

      return this.isListAscending ? list : list.reverse();
    },
    locationListUnfiltered: {
      get() {
        return this.$store.getters.locationList;
      }
    },
    randomIndexScale() {
      let indices = Array.from(this.locationListUnfiltered.keys());
      return d3.scaleOrdinal()
        .range([...indices].sort(() => Math.random() - 0.5))   // Line to shuffle elements inside an array. - Inspired by this blog here: https://flaviocopes.com/how-to-shuffle-array-javascript/
        .domain(indices);
    },
  },
  watch: {
    latestDate: {
      handler() {
        this.initTimeInterval();
      },
      deep: true,
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .list-group {
    height: 600px;
    overflow-y: auto;
  }
</style>
