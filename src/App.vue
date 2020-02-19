<template>
  <v-app id="inspire">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>
    <v-content>
      <v-container fluid class="grey lighten-5">
        <v-row>
          <v-col cols="4">
            <Menu @uploaded="uploadedImage" />
          </v-col>
          <v-col cols="8">
            <ImageResult :image="this.image" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; De Soyboys 2k20</span>
    </v-footer>
  </v-app>
</template>

<script>
import Menu from "@/components/Menu.vue";
import ImageResult from "@/components/ImageResult.vue";

export default {
  data() {
    return {
      image: new File([""], "placeholder")
    };
  },

  components: {
    Menu,
    ImageResult
  },

  methods: {
    uploadedImage(image) {
      this.image = image;
    }
  }
};
</script>

<style>
html {
  overflow-y: auto !important;
}
</style>
