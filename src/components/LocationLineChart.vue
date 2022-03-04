<template>
<div class="container-fluid">
    <div class="row">
      <div style="margin-left:auto; margin-right:0">
          <b-dropdown class="scroll-dropdown" size="sm" v-bind:text="selectedDataOption">
            <b-dropdown-item v-for="entry in Object.keys(dataOptions)" v-bind:key="entry" v-on:click="selectDataOption(entry)">
              {{entry}}
            </b-dropdown-item>
          </b-dropdown>
        </div>
    </div>
    <div class="row">
      <svg class="main-svg" :width="svgWidth" :height="svgHeight">
        <g class="chart-group" ref="chartGroup">
          <g class="axis axis-x" ref="axisX"></g>
          <g class="axis axis-y" ref="axisY"></g>
          <g class="bar-group" ref="barGroup"></g>
        </g>
      </svg>
    </div>
</div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'LocationLineChart',
  props: ["selectedTimeInterval", "selectedLocations", "isDataAccumulated", "randomIndexScale"],
  data() {
    return {
      selectedDataOption: "cases",

      // Canvas
      svgWidth: 1250,
      svgHeight: 400,
      svgPadding: {
        top: 15, right: 55, bottom: 20, left: 30
      },
      transitionSpeed: 200
    }
  },
  mounted() {
    d3.select(this.$refs.chartGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);

    if(this.locationList.length != 0) {
      this.drawChart();
    }
  },
  methods: {
    drawChart() {
      this.drawXAxis();
      this.drawYAxis();
      this.drawLines();
    },
    drawXAxis() {
      let axis = d3.axisBottom(this.xScale);

      const amountDays = Math.round((this.selectedTimeInterval[1] - this.selectedTimeInterval[0]) / (1000 * 60 * 60 * 24));
      if(amountDays <= 21) {
        axis.ticks(d3.timeDay);
      }
      else if(amountDays > 21 && amountDays <= 168) {
        axis.ticks(d3.timeWeek);
      }
      else if(amountDays > 168) {
        axis.ticks(d3.timeMonth);
      }

      d3.select(this.$refs.axisX)
        .attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);
    },
    drawYAxis() {
      let axis = d3.axisLeft(this.yScale)
        .ticks(3)
        .tickFormat(d3.format('.2s'));

      d3.select(this.$refs.axisY)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);
    },
    drawLines() {
      let option = this.isDataAccumulated ? this.dataOptions[this.selectedDataOption][1] : this.dataOptions[this.selectedDataOption][0];
      let locations = this.graphData.map(d => d.location);

      d3.select(this.$refs.barGroup)
        .selectAll('.line')
        .data(this.graphData.map(d => d.dailyData))
        .join('path')
          .on("mouseover", this.highlightLocation)
          //.on("mouseout", this.unhighlightPoint)
          //.on("click", toggleLineSelection)
          .transition()
          .duration(this.transitionSpeed)
          .attr("location", (d, i) => locations[i])   // For identifying the correct location
          .attr('class', 'line')
          .attr("fill", "none")
          .attr("stroke", (d, i) => {     // Disabled "no-unused-vars" in eslint config inside package.json in order to do this
            let globalLocationIndex = this.locationList.indexOf(locations[i]);
            return d3.color(d3.interpolateRainbow(this.randomIndexScale(globalLocationIndex) / this.locationList.length)).formatHex()
          })
          .attr("stroke-width", 1.5)
          //.attr("state", (d, i) => states[i])
          .attr("d", d3.line()
            .x(d => this.xScale(d3.timeDay.round(d.date)))    // Remove time partion of the date object so that the data correctly alligns with the x-axis
            .y(d => {
              const value = d[option] !== null ? d[option] : 0;   // If there's no data, use 0 instead
              return this.yScale(value);
            })
          );
    },
    selectDataOption(dataOption) {
      this.selectedDataOption = dataOption;
    },
    highlightLocation(event) {
      let location = d3.select(event.target).attr("location");
      this.$emit('highlightLocation', location);    // Trigger event so that the parent component can receive the name of the location
    },
  },
  computed: {
    dataOptions: {
      get() {
        return this.$store.getters.dataOptions;
      }
    },
    earliestDate: {
      get() {
        return this.$store.getters.earliestDate;
      }
    },
    locationList: {
      get() {
        return this.$store.getters.locationList;
      }
    },
    graphData() {
      let data = this.selectedLocations.map((location) => {
        return {...this.$store.getters.covidDataLocation(location)};  // Make deep copy to not accidentally alter the data inside the state
      });

      let filteredData = data;
      if(this.selectedTimeInterval[0] != this.earliestDate) {
        filteredData.forEach((d, index) => {
          filteredData[index].dailyData = d.dailyData.filter((day) => {
            return day.date >= this.selectedTimeInterval[0] && day.date <= this.selectedTimeInterval[1];
          });
        });
      }

      return filteredData;
    },
    maxValue() {
      let option = this.isDataAccumulated ? this.dataOptions[this.selectedDataOption][1] : this.dataOptions[this.selectedDataOption][0];
      
      if(this.isDataAccumulated) {
        return d3.max(this.graphData, (location) => location.dailyData.at(-1)[option]);
      }

      let max = d3.max(this.graphData, (location) => {
        return d3.max(location.dailyData, (day) => day[option]);
      });

      return isNaN(max) ? 0 : max;  // If there's no data available for the selected option, return 0
    },
    xScale() {
      let scale = d3.scaleTime()
        .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        .domain(this.selectedTimeInterval.map(date => d3.timeDay.round(date)));
      //this.graphData.length != 0 ? scale.domain(this.selectedTimeInterval) : scale.domain();

      return scale;
    },
    yScale() {
      return d3.scaleLinear()
        .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        .domain([0, this.maxValue]);
    },
  },
  watch: {
    graphData: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    isDataAccumulated: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedDataOption: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
}
</script>

<style>
</style>
