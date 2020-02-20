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
          class="mb-2"
          color="blue-grey darken-3"
          label="Image input"
          accept="image/*"
          prepend-icon="mdi-camera"
          :show-size="1000"
          required
          :rules="imageRules"
        />
        <!-- Field to select method for centroid generation -->
        <v-select
          color="blue-grey darken-3"
          :items="methods"
          class="mb-2"
          v-model="selectedMethod"
          label="Method for centroid generation"
          required
          :rules="methodRules"
        />
        <!-- Threshold for number of centroids -->
        <v-text-field
          color="blue-grey darken-3"
          v-if="selectedMethod === 'Edge detection'"
          label="Number of centroids"
          class="mb-2"
          v-model="selectedThreshold"
          :rules="thresholdRules"
          type="number"
        />
        <!-- Reset and submit button group -->
        <v-row align="start" justify="space-around">
          <v-btn color="error" class="mr-4" @click="reset">Reset</v-btn>
          <v-btn
            :disabled="!valid"
            class="blue-grey darken-3 white--text mr-4"
            @click="validate"
            >Submit</v-btn
          >
        </v-row>
      </v-form>
    </v-card-text>
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

    // Selected threshold and associated rules
    selectedThreshold: 10,
    thresholdRules: [
      v =>
        (!!v && v <= 1000 && v >= 10) ||
        "A threshold of at least 10 and at most 1000 is required"
    ],

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
          selectedMethod: this.selectedMethod,
          selectedThreshold: this.selectedThreshold
        });
      }
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
