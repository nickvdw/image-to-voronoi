<template>
  <v-carousel
    hide-delimiter-background
    show-arrows-on-hoverv-model="model"
    height="100%"
    style="height:100%"
  >
    <v-carousel-item style="height: 100%">
      <v-sheet color="blue-grey darken-1" height="100%" tile>
        <v-row class="fill-height" align="center" justify="center">
          <div class="display-3">Slide</div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
    <v-carousel-item style="height: 100%">
      <v-sheet color="blue-grey darken-1" height="100%" tile>
        <v-row class="fill-height" align="center" justify="center">
          <div class="display-3">Slide</div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
    <v-carousel-item style="height: 100%">
      <v-sheet color="blue-grey darken-1" height="100%" tile>
        <v-row class="fill-height" align="center" justify="center">
          <div class="display-3">Slide</div>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script>
export default {
  data() {
    return {
      model: 0
    };
  }
};
</script>
