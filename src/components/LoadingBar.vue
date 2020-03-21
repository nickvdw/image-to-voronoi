<template>
  <v-row
    style="height: 100%"
    v-if="this.loading"
    class="fill-height"
    align-content="center"
    justify="center"
  >
    <v-col class="subtitle-1 text-center" cols="12">
      Generating the result. This might take a while.
    </v-col>
    <!-- <v-col cols="6">
      <v-progress-linear
        :value="value"
        rounded
        color="blue-grey darken-3"
        height="12"
      />
    </v-col> -->
  </v-row>
</template>

<script>
export default {
  name: "LoadingBar",
  props: {
    loading: {
      type: Boolean,
      required: true,
      default: false
    },
    value: {
      type: Number,
      required: true,
      default: 0
    }
  }
};
</script>
