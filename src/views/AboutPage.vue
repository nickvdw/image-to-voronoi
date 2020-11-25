<template>
  <v-container fluid>
    <p class="display-1 text-center py-5">
      Voronoier was brought to you by these wonderful people:
    </p>
    <v-row dense justify="center">
      <v-col v-for="item in items" :key="item.name" align="center" cols="2">
        <v-card outlined width="350px">
          <v-img
            :src="item.image"
            class="align-end"
            width="350px"
            height="400px"
          />
          <v-card-title class="justify-center">{{ item.name }}</v-card-title>
          <v-card-subtitle class="justify-center">{{ item.caption }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <p class="subtitle-1 text-center py-5">
      This application was made as part of a research paper on transforming
      images into Voronoi diagrams based on the <i>n</i>-nearest centroids.
      <br />
      This was done for the course [2IMV10] Visual Computing Project at the
      University of Technology in Eindhoven. <br />
      For those who are interested and want to indulge themselves into technical
      details, the paper regarding this application can be found here.<br /><br />
    </p>

    <p class="subtitle-1 text-center">
      Furthermore, we would like to thank our supervisor Michael Burch for
      providing us with the necessary feedback during the project.
    </p>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      drawer: null,
      items: [
        { 
          name: "dr. rer. nat. Michael Burch",
          caption: "Project supervisor",
          image: require("../../public/img/michael.png")
        },
        { 
          name: "John van Lith",
          caption: "Developer",
          image: require("../../public/img/john.png")
        },
        {
          name: "Nick van de Waterlaat",
          caption: "Developer",
          image: require("../../public/img/nick.png")
        },
        {
          name: "Jurriën van Winden",
          caption: "Developer",
          image: require("../../public/img/jurrien.png")
        }
      ]
    };
  }
};
</script>
