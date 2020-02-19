<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="indigo white--text">
      <span class="title">Configuration</span>
      <v-spacer />
    </v-card-title>

    <!-- Card content -->
    <v-card-text>
      <!-- Form -->
      <v-form ref="form" v-model="valid">
        <!-- Image upload field -->
        <v-file-input
          v-model="image"
          class="mt-4"
          color="deep-purple accent-4"
          label="Image input"
          accept="image/*"
          prepend-icon="mdi-camera"
          :show-size="1000"
          required
          :rules="imageRules"
        />

        <!-- Reset and submit button group -->
        <v-row align="start" justify="space-around">
          <v-btn color="error" class="mr-4" @click="reset">
            Reset
          </v-btn>
          <v-btn
            :disabled="!valid"
            class="indigo white--text mr-4"
            @click="validate"
          >
            Submit
          </v-btn>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Menu",

  data: () => ({
    // We have to define image as undefined in order to make the image rule for validation work
    image: undefined,
    // The rule we place on image submissions
    imageRules: [v => (!!v && v !== []) || "An image is required"],
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
        this.$emit("submit", { image: this.image });
      }
    },

    /**
     * Resets (i.e., clears) the form data.
     *
     * Emits meaningless form data to indicate there is no image anymore.
     */
    reset() {
      this.$refs.form.reset();
      this.$emit("submit", "reset");
    }
  }
};
</script>
