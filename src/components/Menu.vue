<template>
  <v-card>
    <v-card-title class="indigo white--text">
      <span class="title">Configuration</span>
      <v-spacer />
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="valid" :lazy-validation="lazy">
        <v-file-input
          v-model="image"
          class="mt-4"
          color="deep-purple accent-4"
          label="Image input"
          accept="image/*"
          placeholder="Select your image"
          prepend-icon="mdi-camera"
          outlined
          id="inputimage"
          @change="onImageUploaded"
          :show-size="1000"
        />
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Menu",

  data() {
    return {
      image: []
    };
  },

  methods: {
    onImageUploaded() {
      this.$emit("uploaded", this.image);
    }
  }
};
</script>
