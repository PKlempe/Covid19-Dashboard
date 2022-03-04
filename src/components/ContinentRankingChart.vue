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
  name: 'ContinentRankingChart',
  props: ["data"],
  data() {
    return {
      svgWidth: 450,
      svgHeight: 400,
      svgPadding: {
        top: 45, right: 0, bottom: 0, left: 0
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
      this.drawBars();
      this.drawLabels();
    },
    drawXAxis() {
      let axis = d3.axisBottom(this.xScale)
        .ticks(4);

      d3.select(this.$refs.axisX)
        .attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom})`)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);
    },
    drawYAxis() {
      let axis = d3.axisRight(this.yScale);

      d3.select(this.$refs.axisY)
        .transition()
        .duration(this.transitionSpeed)
        .call(axis);
    },
    drawBars() {
      d3.select(this.$refs.barGroup)
        .selectAll('.rect')
        .data(this.data)
        .join('rect')
          .transition()
          .duration(this.transitionSpeed)
          .attr('class', 'rect')
          .attr("fill", d => this.colorScale(d.continent))
          .attr("x", this.xScale(0))
          .attr("y", d => this.yScale(d.continent))
          .attr("height", this.yScale.bandwidth())
          .attr("width", d => this.xScale(d.value));
    },
    drawLabels() {
      let chartGroup = d3.select(this.$refs.chartGroup);

      chartGroup.selectAll('.labelContinent')
        .data(this.data)
        .join('text')
          .attr("class", "labelContinent")
          .attr("x", this.xScale(0))
          .attr("y", d => this.yScale(d.continent) - 5)
          .style("font-size", "25px")
          .attr("font-weight", 700)
          .text((d) => d.continent);

        chartGroup.selectAll('.labelCounter')
        .data(this.data)
        .join('text')
          .attr("class", "labelCounter")
          .attr("x", this.xScale(this.maxValue))
          .attr("y", d => this.yScale(d.continent) - 5)
          .style("text-anchor", "end")
          .style("font-size", "18px")
          .attr("font-weight", 550)
          .text((d) => d.value.toLocaleString());
    }
  },
  computed: {
    maxValue() {
      return d3.max(this.data, (d) => d.value);
    },
    xScale() {
      return d3.scaleLinear()
        .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        .domain([0, this.maxValue]);
    },
    yScale() {
      return d3.scaleBand()
        .range([0, this.svgHeight - this.svgPadding.top - this.svgPadding.bottom])
        .domain(this.data.map(d => d.continent))
        .paddingInner(0.7);
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
