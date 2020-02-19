<template>
  <div class="menu">
    <v-file-input
      v-model="image"
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
  </div>
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
