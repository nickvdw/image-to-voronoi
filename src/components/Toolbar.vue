<template>
  <div>
    <v-navigation-drawer disable-resize-watcher v-model="sidebar" app>
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
      <v-toolbar color="blue-grey darken-3" dense>
        <v-app-bar-nav-icon
          class="hidden-sm-and-up white--text"
          @click="sidebar = !sidebar"
        />
        <v-toolbar-title class="white--text">
          <router-link to="/" tag="span" style="cursor: pointer">
            {{ appTitle }}
          </router-link>
        </v-toolbar-title>
        <v-spacer />

        <v-toolbar-items class="hidden-xs-only">
          <v-btn
            class="white--text caption"
            text
            ripple
            v-for="item in menuItems"
            :key="item.title"
            :to="item.path"
          >
            <v-icon left medium dense>mdi-{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Toolbar",

  data() {
    return {
      appTitle: "Application",
      menuItems: [
        { title: "Tool", path: "/tool", icon: "toolbox-outline" },
        { title: "Help", path: "/help", icon: "help-circle-outline" },
        { title: "About", path: "/about", icon: "information-outline" }
      ],
      sidebar: false
    };
  },

  watch: {
    /**
     * Watcher on the image that removes the previous image if the user
     * clicks on the "reset" button and renders the new image when
     * form details are submitted.
     */
    image: async function() {
      // Don't continue when there is no actual image
      if (!this.image) {
        // Clear the previous image
        document.getElementById("voronoiResult").innerHTML = "";
      } else {
        this.loading = true;
        await this.generateResult();
        this.loading = false;
      }
    }
  },

  methods: {}
};
</script>
