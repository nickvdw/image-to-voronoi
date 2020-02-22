<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Result</span>
      <v-spacer />
      <!-- TODO: Refactor to for loop -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            @click="toggle"
            v-on="on"
            icon
            :disabled="!configuration.selectedImage"
          >
            <v-icon>mdi-fullscreen</v-icon>
          </v-btn>
        </template>
        <span>View the result in fullscreen</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            @click="saveImage"
            v-on="on"
            icon
            :disabled="!configuration.selectedImage"
          >
            <v-icon>mdi-content-save-outline</v-icon>
          </v-btn>
        </template>
        <span>Save the image</span>
      </v-tooltip>

      <v-menu bottom left origin="center center" transition="scale-transition">
        <template v-slot:activator="{ on: menu }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                dark
                v-on="{ ...tooltip, ...menu }"
                icon
                :disabled="!configuration.selectedImage"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <span> Display other options </span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>What would you like to see?</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            @click="generateResult(item)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <!-- Card content -->
    <v-card-text>
      <div v-show="!this.configuration.selectedImage && !this.loading">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="subtitle-1 text-center" cols="12">
            Please select an image.
          </v-col>
        </v-row>
      </div>
      <!-- Progress bar -->
      <div v-show="this.loading">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="subtitle-1 text-center" cols="12">
            Generating the result
          </v-col>
          <v-col cols="6">
            <v-progress-linear
              indeterminate
              rounded
              color="blue-grey darken-3"
              height="12"
            />
          </v-col>
        </v-row>
      </div>
      <!-- Image result  -->
      <div v-show="!this.loading">
        <fullscreen
          class="wrapper"
          :fullscreen.sync="fullscreen"
          ref="fullscreen"
          @change="fullscreenChange"
          background="#eee"
        >
          <!-- The image represneting the result -->
          <v-row
            v-show="this.configuration.selectedImage"
            align="start"
            justify="center"
          >
            <!-- TODO: Only render a single result that is updated based on the user's needs -->
            <div ref="result" v-show="this.displayResult" id="voronoiResult" />
          </v-row>
        </fullscreen>
      </div>
      <div>
        <canvas v-show="this.displayEdges" id="findEdges" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
require("tracking");
require("tracking/build/data/face-min");

import {
  uploadImage,
  greyScaleImage,
  toImageDataUrl,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";
import { renderColoredVoronoi } from "@/scripts/voronoiUsingD3";

import * as d3 from "d3";
import Fullscreen from "vue-fullscreen/src/component.vue";

export default {
  name: "Result",
  components: {
    Fullscreen
  },
  data() {
    return {
      loading: false,
      items: [
        { title: "Original image" },
        { title: "Result" },
        { title: "Centroids" }
      ],
      displayResult: false,
      originalImageData: [],
      centroids: [],
      fullscreen: false,
      displayEdges: true
    };
  },
  props: {
    // The configuration that is set by the user
    configuration: {
      type: Object,
      required: true,
      default: function() {
        return {
          selectedImage: null,
          selectedMethod: null,
          selectedThreshold: null,
          selectedAlgorithm: null,
          // These are false by default in the UI
          displayEdges: false,
          displayCentroids: false
        };
      }
    }
  },
  watch: {
    /**
     * Watcher on the configuration provided by the user that removes
     * the previous image if the user clicks on the "reset" button and
     * renders the new image when form details are submitted.
     */
    configuration: async function() {
      // Only continue if there is an actual image
      if (this.configuration.selectedImage) {
        this.loading = true;
        const result = await uploadImage(this.configuration.selectedImage);
        this.originalImageData = {
          data: [...result.data],
          width: result.width,
          height: result.height
        };
        this.generateResult({ title: "Result" });
        this.displayResult = true;
        this.loading = false;
      } else {
        // Clear the previous image
        document.getElementById("voronoiResult").innerHTML = "";
      }
    }
  },
  methods: {
    /**
     * Opens a prompt with which an image can be saved.
     */
    async saveImage() {
      // Convert the image from a div to a canvas element
      const result = await this.$html2canvas(this.$refs.result, {
        type: "dataURL"
      });
      const link = document.createElement("a");
      link.download = "filename.png";
      link.href = result;
      link.click();
    },
    /**
     * Toggles between fullscreen and windowed.
     */
    toggle() {
      this.$refs["fullscreen"].toggle();
    },
    fullscreenChange(fullscreen) {
      this.fullscreen = fullscreen;
    },
    /**
     * Sets the voronoiResult div to the given image data
     */
    setImage(imageData) {
      d3.select("#voronoiResult")
        .attr("width", imageData.width)
        .attr("height", imageData.height)
        .append("svg")
        .attr("width", imageData.width)
        .attr("height", imageData.height)
        .append("image")
        .attr("href", toImageDataUrl(imageData))
        .attr("width", imageData.width)
        .attr("height", imageData.height);
    },
    /**
     * Renders an image depending on the choice
     */
    generateResult(choice) {
      // Clear the previous image
      document.getElementById("voronoiResult").innerHTML = "";
      // TODO: Make the image fit to the div or vice versa.

      let centroids = [];
      let coloredCentroids = [];
      let greyScaleImageData;
      const imageDataCopy = {
        ...this.originalImageData,
        data: [...this.originalImageData.data]
      };
      // Only display the result chosen by the user
      switch (choice.title) {
        case "Original image":
          this.setImage(this.originalImageData);
          break;
        case "Result":
          // TODO: Check all choices passed through the configuration here
          greyScaleImageData = greyScaleImage(imageDataCopy);
          centroids = [
            ...computeCentroidsFromGreyScale(
              greyScaleImageData,
              0.8,
              false,
              20,
              10
            ),
            ...computeCentroidsFromGreyScale(
              greyScaleImageData,
              0.5,
              true,
              20,
              10
            )
          ];
          coloredCentroids = colorCentroidsByCoordinates(
            this.originalImageData,
            centroids
          );
          renderColoredVoronoi(
            coloredCentroids,
            this.originalImageData.width,
            this.originalImageData.height,
            4
          );
          // TODO: Set the result through setImage
          // this.setImage(greyScaleImageData);
          break;
        case "Centroids":
          greyScaleImageData = greyScaleImage(imageDataCopy);
          centroids = [
            ...computeCentroidsFromGreyScale(
              greyScaleImageData,
              0.8,
              false,
              20,
              10
            ),
            ...computeCentroidsFromGreyScale(
              greyScaleImageData,
              0.5,
              true,
              20,
              10
            )
          ];
          this.setImage(greyScaleImageData);
          break;
        default:
        // TODO: catch error
      }
      return;
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  height: 400px;
  &.fullscreen {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.voronoiResult {
  width: 300px;
  height: 300px;
}
</style>
