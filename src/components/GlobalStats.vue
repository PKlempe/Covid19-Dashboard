<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-2" align="left">
        <h2>Global Stats</h2>
      </div>
      <div class="col-md-5">
        <div align="left">
          <b-button-group size="sm">
            <b-button id="btnCovidMode" v-bind:pressed="covidMode" v-on:click="setDataMode" variant="outline-danger">Covid</b-button>
            <b-button id="btnVaccineMode" v-bind:pressed="!covidMode" v-on:click="setDataMode" variant="outline-info">Vaccine</b-button>
          </b-button-group>
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
          <b-dropdown id="dropDataInterval" size="sm" right  v-bind:text=dataInterval>
            <b-dropdown-item v-on:click="setDataInterval">Month</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">6 Months</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">Year</b-dropdown-item>
            <b-dropdown-item v-on:click="setDataInterval">All Time</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div class="row align-items-center">
      <div class="col-md-3" align="left">
        <h5 id="titleCasesVac"/>
        <h1 id="cntrCasesVac"/>
      </div>
      <div class="col-md-9">
        <GlobalBarChart v-bind:data="graphData[0]" v-bind:isDataAccumulated="isDataAccumulated" v-bind:selectedTimeInterval="selectedTimeInterval"/>
      </div>
    </div>
    <div class="row align-items-center">
      <div class="col-md-3" align="left">
        <h5 id="titleDeathsPplVac"/>
        <h1 id="cntrDeathsPplVac"/>
      </div>
      <div class="col-md-9">
        <GlobalBarChart v-bind:data="graphData[1]" v-bind:isDataAccumulated="isDataAccumulated" v-bind:selectedTimeInterval="selectedTimeInterval"/>
      </div>
    </div>
  </div>
</template>

<script>
import GlobalBarChart from './GlobalBarChart.vue';

export default {
  name: 'GlobalStats',
  components: {
    GlobalBarChart,
  },
  props: {
  },
  data() {
    return {
      covidMode: true,
      isDataAccumulated: false,
      dataInterval: "Month",
    }
  },
  mounted() {
    // Maybe do something here
  },
  methods: {
    setDataMode(event) {
      this.covidMode = event.target.id == "btnCovidMode" ? this.covidMode = true : this.covidMode = false;
      this.updateStats();
    },
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
    updateStats() {
      let cntrCasesVac = document.getElementById("cntrCasesVac");
      let cntrDeathsPplVac = document.getElementById("cntrDeathsPplVac");
      let titleCasesVac = document.getElementById("titleCasesVac");
      let titleDeathsPplVac = document.getElementById("titleDeathsPplVac");

      cntrCasesVac.textContent = this.covidMode ? this.totalCases.toLocaleString() : this.totalVaccinations.toLocaleString();
      cntrDeathsPplVac.textContent = this.covidMode ? this.totalDeaths.toLocaleString() : this.totalPeopleVaccinated.toLocaleString();
      titleCasesVac.textContent = this.covidMode ? "Total Cases" : "Total Vaccinations";
      titleDeathsPplVac.textContent = this.covidMode ? "Total Deaths" : "Total People Vaccinated";
    }
  },
  computed: {
    selectedYear: {
      get() {
        return this.$store.getters.selectedYear;
      },
      set(val) {
        this.$store.commit('changeSelectedYear', val);
      },
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
        return this.$store.getters.covidDataLocation("World");
      }
    },
    graphData() {
      if(this.covidData === undefined) {
        return [undefined, undefined];
      }

      let filteredData = this.covidData.dailyData;
      if(this.selectedTimeInterval[0] != this.earliestDate) {
        filteredData = filteredData.filter((day) => {
          return day.date >= this.selectedTimeInterval[0] && day.date <= this.selectedTimeInterval[1];
        });
      }

      let graphDataCasesVac = Array(filteredData.length);
      let graphDataDeathsPplVac = Array(filteredData.length);

      filteredData.forEach((day, index) => {
        let dateObject = new Date(day.date.toDateString());
        let casesVacData = {date: dateObject};
        let deathsPplVacData = {date: dateObject};
          
        if(this.covidMode) {
          if(this.isDataAccumulated) {
            casesVacData["value"] = day.total_cases;
            deathsPplVacData["value"] = day.total_deaths;
          }
          else {
              casesVacData["value"] = day.new_cases;
              deathsPplVacData["value"] = day.new_deaths;
          }
        }
        else {
          if(this.isDataAccumulated) {
            casesVacData["value"] = day.total_vaccinations;
            deathsPplVacData["value"] = day.people_vaccinated;
          }
          else {
              casesVacData["value"] = day.new_vaccinations;
              deathsPplVacData["value"] = day.new_people_vaccinated_smoothed;
          }
        }

        graphDataCasesVac[index] = casesVacData;
        graphDataDeathsPplVac[index] = deathsPplVacData;
      });

      return [graphDataCasesVac, graphDataDeathsPplVac];
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
    totalCases() {
      return this.covidData.dailyData.at(-1).total_cases;
    },
    totalVaccinations() {
      return this.covidData.dailyData.at(-1).total_vaccinations;
    },
    totalDeaths() {
      return this.covidData.dailyData.at(-1).total_deaths;
    },
    totalPeopleVaccinated() {
      return this.covidData.dailyData.at(-1).people_vaccinated;
    },
  },
  watch: {
    covidData: {
      handler() {
        this.updateStats();
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
</style>
