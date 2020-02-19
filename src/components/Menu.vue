<template>
  <v-card>
    <v-card-title class="indigo white--text">
      <span class="title">Configuration</span>
      <v-spacer />
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="valid">
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
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Menu",

  data: () => ({
    image: undefined,
    imageRules: [v => (!!v && v !== []) || "An image is required"],
    valid: false
  }),

  mounted() {
    console.log(this.image);
  },

  watch: {
    image: function() {
      console.log(this.image);
    }
  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    reset() {
      this.$refs.form.reset();
    },
    onImageUploaded() {
      this.$emit("uploaded", this.image);
    }
  }
};
</script>
