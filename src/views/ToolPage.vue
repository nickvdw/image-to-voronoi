<template>
  <v-row>
    <!-- Left column -->
    <v-col cols="4">
      <Menu @submit="submittedForm" />
    </v-col>
    <!-- Right column -->
    <v-col cols="8">
      <Result :image="this.image" />
    </v-col>
  </v-row>
</template>

<script>
import Menu from "@/components/Menu.vue";
import Result from "@/components/Result.vue";

export default {
  data() {
    return {
      image: new File([""], "placeholder")
    };
  },

  components: {
    Menu,
    Result
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
