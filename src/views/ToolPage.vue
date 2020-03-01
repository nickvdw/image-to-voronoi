<template>
  <v-container class="fullHeight" full-width fluid>
    <v-row class="fullHeight">
      <!-- Left column -->
      <v-col xl="3" lg="3" md="4" sm="12" xs="12">
        <Menu @submit="submittedForm" :loading="loading" />
      </v-col>
      <!-- Right column -->
      <v-col xl="9" lg="9" md="8" sm="12" xs="12" class="fullHeight">
        <Result :configuration="this.processedObject" @loading="setLoading" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Menu from "@/components/Menu.vue";
import Result from "@/components/Result.vue";
export default {
  data() {
    return {
      // There is no object (image, etc) present initially
      processedObject: {},
      loading: false
    };
  },
  components: {
    Menu,
    Result
  },
  methods: {
    /**
     * Pass the @object if there is one. Otherwise, pass an empty object.
     */
    submittedForm(object) {
      // We also set an empty object when we want to explicitly reset the canvas
      // TODO: Check if we have all object attributes, then don't have to do check in the child component anymore
      if (object !== "reset" && object) {
        this.processedObject = object;
      } else {
        this.processedObject = {};
      }
    },
    setLoading(state) {
      this.loading = state;
    }
  }
};
</script>

<style>
.fullHeight {
  height: 100%;
}
</style>
