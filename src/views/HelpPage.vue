<template>
  <v-container>
    <v-navigation-drawer floating permanent>
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        drawer: null,
        items: [
          { title: 'General information', icon: 'dashboard' },
          { title: 'Importing an image', icon: 'question_answer' },
          { title: 'Algorithm', icon: 'question_answer' },
          { title: 'Centroid generation', icon: 'question_answer' },
          { title: 'Pruning', icon: 'question_answer' },
          { title: 'Display', icon: 'question_answer' },
          { title: 'Editing the diagram', icon: 'question_answer' },
        ],
      }
    },
  }
</script>
