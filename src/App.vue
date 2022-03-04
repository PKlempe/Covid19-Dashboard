<template>
  <div id="app">
    <h1 id="title">Covid19-Dashboard</h1>
    <div class="container-fluid">
      <div class="row" style="margin-bottom: 5em">
        <div class="col">
          <GlobalStats/>
        </div>
      </div>
      <div class="row" style="margin-bottom: 5em">
        <div class="col">
          <ContinentStats/>
        </div>
      </div>
      <div class="row" style="margin-bottom: 5em">
        <div class="col">
          <LocationStats/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GlobalStats from './components/GlobalStats.vue';
import ContinentStats from './components/ContinentStats.vue';
import LocationStats from './components/LocationStats.vue';

export default {
  name: 'App',
  components: {
    GlobalStats, ContinentStats, LocationStats,
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>
#title {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 1.5em;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 2em;
}
</style>
