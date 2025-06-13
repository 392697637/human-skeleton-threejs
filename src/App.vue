<template>
  <div id="app">
    <HumanSkeleton     />
  </div>
</template>

<script>
import HumanSkeleton from './components/HumanSkeleton.vue'

export default {
  components: {
    HumanSkeleton
  }
}
</script>

<style>
html, body, #app {
  margin: 0; padding: 0; height: 100%;
  overflow: hidden;
}
</style>
