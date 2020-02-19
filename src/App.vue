<template>
  <v-app>
    <Toolbar />
    <v-content class="grey lighten-5">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";
import Footer from "@/components/Footer.vue";

export default {
  data() {
    return {
      image: new File([""], "placeholder")
    };
  },

  components: {
    Toolbar,
    Footer
  },

  // Only used for development
  created() {
    this.$router.push("/tool");
  }
};
</script>

<style>
html {
  overflow-y: auto !important;
}
</style>
