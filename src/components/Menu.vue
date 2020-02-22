<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Configuration</span>
      <v-spacer />
    </v-card-title>
    <!-- Card content -->
    <v-card-text>
      <!-- Form -->
      <v-form ref="form" v-model="valid">
        <!-- Image upload field -->
        <v-file-input
          v-model="selectedImage"
          color="blue-grey darken-3"
          label="Input image"
          accept="image/*"
          prepend-icon="mdi-camera"
          :show-size="1000"
          required
          :rules="imageRules"
        />
        <!-- Algorithms to use -->
        <v-select
          color="blue-grey darken-3"
          item-color="blue-grey darken-4"
          :items="algorithms"
          v-model="selectedAlgorithm"
          label="Algorithm"
          required
          :rules="algorithmRules"
        />
        <!-- Field to select method for centroid generation -->
        <v-select
          color="blue-grey darken-3"
          item-color="blue-grey darken-4"
          :items="methods"
          v-model="selectedMethod"
          label="Method for centroid generation"
          required
          :rules="methodRules"
        />
        <!-- Threshold for number of centroids -->
        <v-text-field
          color="blue-grey darken-3"
          label="Number of centroids"
          v-model="selectedThreshold"
          :rules="thresholdRules"
          type="number"
        />
        <v-checkbox
          color="blue-grey darken-3"
          v-model="displayEdges"
          label="Display edges"
        />
        <v-checkbox
          color="blue-grey darken-3"
          v-model="displayCentroids"
          label="Display centroids"
        />
      </v-form>
    </v-card-text>
    <v-divider />
    <!-- Reset and submit button group -->
    <v-card-actions>
      <v-row align="center" justify="space-around">
        <v-btn color="error" @click="reset">Reset</v-btn>
        <v-btn
          :disabled="!valid"
          class="blue-grey darken-3 white--text"
          @click="validate"
        >
          Submit
        </v-btn>
        <v-btn class="blue-grey darken-3 white--text" @click="testValidate">
          Test
        </v-btn>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "Menu",

  data: () => ({
    // Initial image and associated rules
    selectedImage: null,
    imageRules: [v => (!!v && v !== []) || "An image is required"],

    // Available methods for the centroid generation and associated rules
    methods: ["Edge detection", "Random"],
    methodRules: [v => !!v || "A method is required"],
    selectedMethod: "",

    // Available methods for the algorithms and associated rules
    algorithms: ["Naive", "Delaunay triangulation"],
    algorithmRules: [v => !!v || "An algorithm is required"],
    selectedAlgorithm: "",

    // Selected threshold and associated rules
    selectedThreshold: 100,
    thresholdRules: [
      v =>
        (!!v && v <= 5000 && v >= 1) ||
        "A threshold of at least 1 and at most 5000 is required"
    ],

    displayEdges: false,
    displayCentroids: false,

    // Whether or not the form is valid
    valid: false
  }),

  methods: {
    /**
     * Validates whether or not the form is valid (i.e., all REQUIRED
     * parameters have been filled in).
     *
     * Emits the form data if the form is valid.
     */
    validate() {
      if (this.$refs.form.validate()) {
        this.$emit("submit", {
          selectedImage: this.selectedImage,
          selectedAlgorithm: this.selectedAlgorithm,
          selectedMethod: this.selectedMethod,
          selectedThreshold: this.selectedThreshold,
          displayEdges: this.displayEdges,
          displayCentroids: this.displayCentroids
        });
      }
    },

    testValidate() {
      this.$emit("submit", {
        selectedImage: this.selectedImage,
        selectedAlgorithm: this.selectedAlgorithm,
        selectedMethod: this.selectedMethod,
        selectedThreshold: this.selectedThreshold,
        displayEdges: this.displayEdges,
        displayCentroids: this.displayCentroids
      });
    },

    /**
     * Resets (i.e., clears) the form data.
     *
     * Emits meaningless form data to indicate there is no image anymore.
     */
    reset() {
      // Reset all form inputs
      this.$refs.form.reset();
      // Emit a submit event with a rest flag to the toolpage
      this.$emit("submit", "reset");
      // We have to set the default threshold again because it is removed after the reset
      this.selectedThreshold = 10;
    }
  }
};
</script>
