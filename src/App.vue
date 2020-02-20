<template>
  <v-app>
    <Toolbar />
    <v-content class="grey lighten-5">
      <router-view />
    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";
import Footer from "@/components/Footer.vue";

export default {
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
