<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="bar-group" ref="barGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'ContinentBarChart',
  props: ["data", "isDataAccumulated", "selectedTimeInterval", "keys"],
  data() {
    return {
      svgWidth: 1375,
      svgHeight: 400,
      svgPadding: {
        top: 15, right: 45, bottom: 25, left: 13
      },
      transitionSpeed: 200
    }
  },
  mounted() {
    d3.select(this.$refs.chartGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
  },
  methods: {
    drawChart() {
      this.drawXAxis();
      this.drawYAxis();
      this.drawBars();
    },
    drawXAxis() {
      let axis = d3.axisBottom(this.xScale)
        .tickFormat(d3.timeFormat('%b %d'))
        .tickSizeOuter(0);

      if(this.data.length == 30) {
        axis.tickValues(this.xScale.domain().filter((d,i) => !(i%7)));
      }
      else {
        axis.tickValues(this.xScale.domain().filter((d,i) => !(i%28)));
      }

      let xAxis = d3.select(this.$refs.axisX);
      xAxis.attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);
      xAxis.select('.domain').remove();
    },
    drawYAxis() {
      let axis = d3.axisRight(this.yScale)
        .ticks(3)
        .tickFormat(d3.format('.2s'))
        .tickSizeOuter(0);

      let yAxis = d3.select(this.$refs.axisY);
      yAxis.attr('transform', `translate(${this.svgWidth - this.svgPadding.right}, 0)`)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);

      yAxis.select('.domain').remove();
    },
    drawBars() {
      d3.select(this.$refs.barGroup)
        .selectAll("g")
        .data(this.dataStacked)
        .join("g")
          .attr("fill", d => this.colorScale(d.key))
          .selectAll(".bar")
          .data(d => d)
          .join("rect")
            .attr("class", "bar")
            .attr("x", d => this.xScale(d.data.date))
            .attr("y", d => this.yScale(d[1]))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => {
              const bottom = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom - this.yScale(d[0]);
              const top = this.svgHeight - this.svgPadding.top - this.svgPadding.bottom - this.yScale(d[1]);
              const result = top - bottom;

              return result < 0 ? 0 : result;
            });
    },
  },
  computed: {
    maxValue() {
      return d3.max(this.data, (d) => {
        let values = Object.values(d).filter((v) => !(v instanceof Date));
        return d3.sum(values);
      });
    },
    dataStacked() {
      const stack = d3.stack().keys(this.keys);
      return stack(this.data);
    },
    xScale() {
        let dates = this.data.map(d => d.date).sort((a, b) => a - b);
        return d3.scaleBand()
          .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
          .domain(dates)
          .padding(0.05);
    },
    yScale() {
      return d3.scaleLinear()
        .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        .domain([0, this.maxValue]);
    },
    colorScale() {
      return d3.scaleOrdinal()
        .range(this.$colors)
        .domain(["Europe", "Asia", "North America", "South America", "Africa", "Australia"]);
    },
  },
  watch: {
    data: {
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
