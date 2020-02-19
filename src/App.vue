<template>
  <v-app>
    <!-- Tool bar -->
    <v-navigation-drawer v-model="sidebar" app>
      <v-list dense>
        <v-list-item
          link
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
        >
          <v-list-item-action>
            <v-icon>mdi-{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-card flat tile dense>
      <v-toolbar color="deep-purple accent-4" dense>
        <span class="hidden-sm-and-up">
          <v-app-bar-nav-icon class="white--text" @click="sidebar = !sidebar" />
        </span>
        <v-toolbar-title class="white--text">
          <router-link to="/" tag="span" style="cursor: pointer">
            {{ appTitle }}
          </router-link>
        </v-toolbar-title>
        <v-spacer />

        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn
            class="white--text"
            text
            v-for="item in menuItems"
            :key="item.title"
            :to="item.path"
          >
            <v-icon left dark> mdi-{{ item.icon }} </v-icon>
            {{ item.title }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-card>

    <!-- Page content -->
    <v-content class="grey lighten-5">
      <v-container fluid>
        <v-row>
          <!-- Left column -->
          <v-col cols="4">
            <Menu @submit="submittedForm" />
          </v-col>

          <!-- Right column -->
          <v-col cols="8">
            <ImageResult :image="this.image" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <!-- Footer -->
    <v-footer color="indigo" app>
      <span class="white--text">This text is meaningless (fow now)</span>
    </v-footer>
  </v-app>
</template>

<script>
import Menu from "@/components/Menu.vue";
import ImageResult from "@/components/ImageResult.vue";

export default {
  data() {
    return {
      appTitle: "Application",
      menuItems: [
        { title: "Home", path: "/home", icon: "home" },
        { title: "Help", path: "/help", icon: "help" },
        { title: "About", path: "/about", icon: "information-outline" }
      ],
      image: new File([""], "placeholder"),
      sidebar: false
    };
  },

  components: {
    Menu,
    ImageResult
  },

  methods: {
    submittedForm(object) {
      object === "reset"
        ? (this.image = undefined)
        : (this.image = object.image);
    }
  }
};
</script>

<style>
html {
  overflow-y: auto !important;
}
</style>
