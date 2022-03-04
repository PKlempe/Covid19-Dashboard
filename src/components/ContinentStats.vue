<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-3" align="left">
        <h2>Continent Stats</h2>
      </div>
      <div class="col-md-4">
        <div align="left">
          <b-dropdown class="scroll-dropdown" size="sm" v-bind:text="selectedDataOption">
            <b-dropdown-item v-for="entry in Object.keys(dataOptions)" v-bind:key="entry" v-on:click="selectDataOption(entry)">
              {{entry}}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <div class="col-md-4">
        <div align="right">
          <b-button-group size="sm">
            <b-button id="btnDailyData" v-bind:pressed="!isDataAccumulated" v-on:click="setDataAccumulation" variant="outline-primary">Daily Change</b-button>
            <b-button id="btnAccData" v-bind:pressed="isDataAccumulated" v-on:click="setDataAccumulation" variant="outline-primary">Accumulative</b-button>
          </b-button-group>
        </div>
      </div>
      <div class="col-md-1">
        <div align="right">
          <b-dropdown id="dropDataInterval" size="sm" right  v-bind:text="dataInterval">
            <b-dropdown-item v-on:click="setDataInterval">Month</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">6 Months</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">Year</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">All Time</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div class="row align-items-center">
      <div class="col-md-3">
        <ContinentRankingChart v-bind:data="rankingData"/>
      </div>
      <div class="col-md-9">
        <ContinentBarChart v-bind:data="graphData" v-bind:isDataAccumulated="isDataAccumulated" v-bind:selectedTimeInterval="selectedTimeInterval" v-bind:keys="barKeys"/>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

import ContinentRankingChart from './ContinentRankingChart.vue';
import ContinentBarChart from './ContinentBarChart.vue';

export default {
  name: 'ContinentStats',
  components: {
    ContinentRankingChart, ContinentBarChart,
  },
  props: {
  },
  data() {
    return {
      isDataAccumulated: false,
      dataInterval: "Month",
      selectedDataOption: "cases",
    }
  },
  mounted() {
  },
  methods: {
    setDataAccumulation(event) {
      if(event.target.id == "btnAccData" && !this.isDataAccumulated) {
        this.isDataAccumulated = true;
      }
      else if(event.target.id == "btnDailyData" && this.isDataAccumulated) {
        this.isDataAccumulated = false;
      }
    },
    setDataInterval(event) {
      this.dataInterval = event.target.textContent;
    },
    selectDataOption(dataOption) {
      this.selectedDataOption = dataOption;
    },
  },
  computed: {
    dataOptions: {
      get() {
        let options = {...this.$store.getters.dataOptions};    // Make deep copy to not accidentally alter the data inside the state
        // Delete test data, because they are always null for continents
        delete options["tests"];
        delete options["tests per thousand"];

        return options;
      }
    },
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
    covidData: {
      get() {
        return this.$store.getters.covidDataContinents;
      }
    },
    selectedTimeInterval() {
      if(this.latestDate === undefined) {
        return [undefined, undefined];
      }

      let startDate;
      if(this.dataInterval == "All Time") {
        startDate = this.earliestDate;
      }
      else {
        startDate = new Date(this.latestDate);
        if(this.dataInterval == "Month") {
          startDate.setDate(this.latestDate.getDate() - 29)
        }
        else if(this.dataInterval == "6 Months") {
          startDate.setDate(this.latestDate.getDate() - 182);
        }
        else{
          startDate.setDate(this.latestDate.getDate() - 364);
        }
      }

      return [startDate, this.latestDate];
    },
    rankingData() {
      if(this.covidData === undefined) {
        return undefined;
      }

      let rankingData = this.covidData.map((continent) => {
        let o = {continent: continent.location};
        o["value"] = continent.dailyData.at(-1)[this.dataOptions[this.selectedDataOption][1]];

        return o;
      });

      return d3.sort(rankingData, (a, b) => d3.descending(a.value, b.value));
    },
    graphData() {
      if(this.covidData === undefined) {
        return undefined;
      }

      let data = this.covidData.map((continent) => {
        let filteredData = continent.dailyData;
        if(this.selectedTimeInterval[0] != this.earliestDate) {
          filteredData = filteredData.filter((day) => {
            return day.date >= this.selectedTimeInterval[0] && day.date <= this.selectedTimeInterval[1];
          });
        }

        return filteredData.map((day) => {
          let o = {date: new Date(day.date.toDateString())
          };
          o[continent.location] = this.isDataAccumulated ? day[this.dataOptions[this.selectedDataOption][1]] : day[this.dataOptions[this.selectedDataOption][0]];

          return o;
        });
      });

      data = d3.groups(data.flat(), (d) => d.date).map((d) => d[1].reduce((a, b) => {return {...a, ...b};}));
      data.forEach((d, index) => {
        if(Object.keys(d).length != this.barKeys.length + 1) {
          this.barKeys.forEach((continent) => {
            if(d[continent] === undefined) {
              data[index][continent] = 0;
            }
          });
        }
      });
      return data;
    },
    barKeys() {
      if(this.rankingData === undefined) {
        return undefined;
      }

      return this.rankingData.map((d) => d.continent).reverse();
    },
  },
  watch: {
    covidData: {
      handler() {
        //console.log(this.graphData);
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
  .scroll-dropdown /deep/ .dropdown-menu {
    max-height: 200px;
    overflow-y: auto;
  }
</style>
