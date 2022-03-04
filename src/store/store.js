import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    covidData: [],
    dataOptions: {"cases":                          ["new_cases",                                   "total_cases"],
                  "cases per million":              ["new_cases_per_million",                       "total_cases_per_million"],
                  "tests":                          ["new_tests",                                   "total_tests"],
                  "tests per thousand":             ["new_tests_per_thousand",                      "total_tests_per_thousand"],
                  "deaths":                         ["new_deaths",                                  "total_deaths"],
                  "deaths per million":             ["new_deaths_per_million",                      "total_deaths_per_million"],
                  "vaccinations":                   ["new_vaccinations",                            "total_vaccinations"],
                  "people vaccinated":              ["new_people_vaccinated_smoothed",              "people_vaccinated"],
                  "people vaccinated per hundred":  ["new_people_vaccinated_smoothed_per_hundred",  "people_vaccinated_per_hundred"]}
  },
  mutations: {
  },
  getters: {
    covidDataLocation: (state) => (location) => {
      return state.covidData[location];
    },
    covidDataContinents: (state) => {
      if(state.covidData.length == 0) {
        return undefined;
      }
      
      return [state.covidData["Africa"],
              state.covidData["Asia"],
              state.covidData["Europe"],
              state.covidData["North America"],
              state.covidData["South America"],
              state.covidData["Australia"]];
    },
    locationList: (state) => {
      return Object.keys(state.covidData);
    },
    dataOptions: (state) => {
      return state.dataOptions;
    },
    earliestDate (state) {
      return state.covidData["World"]?.dailyData[0].date;       // Uses Optional Chaining (?.) to return "undefined" if the value/object is "nullish" to prevent errors.
    },
    latestDate (state) {
      return state.covidData["World"]?.dailyData.at(-1).date;   // Uses Optional Chaining (?.) to return "undefined" if the value/object is "nullish" to prevent errors.
    },
  },
  actions: {
    loadData({state}) {
      d3.csv('./owid-covid-data.csv', d3.autoType).then((data) => { 
        // Do some data processing
        let processedData = Object.fromEntries(d3.groups(data, d => d.location).map(e => {
          let object = {location:                     e[0],
                        iso_code:                     e[1][0].iso_code,
                        continent:                    e[1][0].continent,
                        population:                   e[1][0].population,
                        population_density:           e[1][0].population_density,
                        median_age:                   e[1][0].median_age,
                        aged_65_older:                e[1][0].aged_65_older,
                        aged_70_older:                e[1][0].aged_70_older,
                        gdp_per_capita:               e[1][0].gdp_per_capita,
                        extreme_poverty:              e[1][0].extreme_poverty,
                        cardiovasc_death_rate:        e[1][0].cardiovasc_death_rate,
                        diabetes_prevalence:          e[1][0].diabetes_prevalence,
                        female_smokers:               e[1][0].female_smokers,
                        male_smokers:                 e[1][0].male_smokers,
                        handwashing_facilities:       e[1][0].handwashing_facilities,
                        hospital_beds_per_thousand:   e[1][0].hospital_beds_per_thousand,
                        life_expectancy:              e[1][0].life_expectancy,
                        human_development_index:      e[1][0].human_development_index
                       };
                  
          object.dailyData = e[1].map(daily => {
            for(let key of Object.keys(object)) {
              delete daily[key];
            }
            return daily;
          });
          return [e[0], object];
        }));

        Object.freeze(processedData);      // Make data immutable for better performance
        state.covidData = processedData;
        //console.log(state.covidData);
      })
    },
  }
})

export default store;
