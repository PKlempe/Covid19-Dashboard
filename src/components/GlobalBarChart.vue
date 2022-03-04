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
  name: 'GlobalBarChart',
  props: ["data", "isDataAccumulated", "selectedTimeInterval"],
  data() {
    return {
      svgWidth: 1375,
      svgHeight: 200,
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
        .selectAll('.rect')
        .data(this.data)
        .join('rect')
          //.on("mouseover", this.highlightPoint)
          //.on("mouseout", this.unhighlightPoint)
          .attr('class', 'rect')
          .attr("fill", "#b8c6db")
          .attr("x", d => this.xScale(d.date))
          .attr("y", d => this.yScale(d.value))
          .attr("width", this.xScale.bandwidth())
          .attr("height", d => {
            return d.value == null ? 0 : this.svgHeight - this.svgPadding.top - this.svgPadding.bottom - this.yScale(d.value);
          });
    },
  },
  computed: {
    maxValue() {
      return d3.max(this.data, (d) => d.value);
    },
    xScale() {
        return d3.scaleBand()
          .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
          .domain(this.data.map(d => d.date))
          .padding(0.05);
    },
    yScale() {
      return d3.scaleLinear()
        .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        .domain([0, this.maxValue]);
    }
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
