<template>
  <!-- TODO: Replace parallax image with something related to Voronoi diagrams -->
  <v-parallax src="https://cdn.vuetifyjs.com/images/parallax/material.jpg">
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12">
        <h1 class="display-1 font-weight-thin mb-4">Application name</h1>
        <h4 class="subheading">Application description</h4>
      </v-col>
    </v-row>
  </v-parallax>
</template>

<style scoped>
/* The v-parallax class does not provide a way to use the full height */
.v-parallax {
  height: 100% !important;
}
</style>
