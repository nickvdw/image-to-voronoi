<template>
  <v-container fluid>
    <v-row>
      <!-- Left column -->
      <v-col cols="4">
        <Menu @submit="submittedForm" />
      </v-col>
      <!-- Right column -->
      <v-col cols="8">
        <Result :configuration="this.processedObject" />
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
      processedObject: {}
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
    }
  }
};
</script>
