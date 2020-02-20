<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Result</span>
      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on }" v-slot:disabled="image">
          <v-btn dark v-on="on" icon :disabled="!image">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-btn dark @click="toggle" icon :disabled="!image">
            <v-icon>mdi-fullscreen</v-icon>
          </v-btn>
          <v-btn dark @click="saveImage" icon :disabled="!image">
            <v-icon>mdi-content-save-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>What would you like to see?</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item v-for="(item, i) in items" :key="i" @click="renderResult(item)">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <!-- Card content -->
    <v-card-text>
      <div v-show="!this.image && !this.loading">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="subtitle-1 text-center" cols="12">Please select an image.</v-col>
        </v-row>
      </div>
      <!-- Progress bar -->
      <div v-show="this.loading">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="subtitle-1 text-center" cols="12">Generating the result</v-col>
          <v-col cols="6">
            <v-progress-linear indeterminate rounded color="blue-grey darken-3" height="12" />
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
          <v-row v-show="this.image" align="start" justify="center">
            <!-- TODO: Only render a single result that is updated based on the user's needs -->
            <div ref="result" v-show="this.displayResult" id="voronoiResult" />
            <canvas v-show="this.displayCentroids" id="centroidCanvas" />
            <canvas v-show="this.displayOriginalImage" id="canvas" />
            <canvas v-show="this.displayGreyScaleImage" id="greyscaleCanvas" />
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
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";

import { renderColoredVoronoi } from "@/scripts/voronoiUsingD3";

import Fullscreen from "vue-fullscreen/src/component.vue";

export default {
  name: "Result",

  data() {
    return {
      loading: false,
      items: [
        { title: "Original image" },
        { title: "Result" },
        { title: "Centroids" }
      ],
      // TODO: Remove this after we use a single div for rendering everything
      displayOriginalImage: false,
      displayResult: false,
      displayCentroids: false,
      displayGreyScaleImage: false,
      displayEdges: true,
      fullscreen: false,
      output: null
    };
  },

  props: {
    // Image needs to be of a File type or null
    image: File
  },

  components: {
    Fullscreen
  },

  watch: {
    /**
     * Watcher on the image that removes the previous image if the user
     * clicks on the "reset" button and renders the new image when
     * form details are submitted.
     */
    // TODO: Make this async., but there are currently issues with generateResult
    // TODO: because we render all "results" inside this method.
    image: function() {
      // Don't continue if there is no actual image
      if (!this.image) {
        // Clear the previous image
        document.getElementById("voronoiResult").innerHTML = "";
      } else {
        this.loading = true;
        // TODO: Call method that checks what type of image (e.g., centroid, original, or voronoi) needs to be rendered.
        this.generateResult();
        this.generateEdges();
        this.loading = false;
        this.displayResult = true;
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
     * Hides and displays the result based on the @choice picked by the user.
     *
     * TODO: This method should not be needed anymore after changing the way
     * we render images.
     */
    renderResult(choice) {
      // Pre-emptively hide all results
      this.displayOriginalImage = false;
      this.displayResult = false;
      this.displayCentroids = false;
      this.displayGreyScaleImage = false;

      // Only display the result chosen by the user
      switch (choice.title) {
        case "Original image":
          this.displayOriginalImage = true;
          break;
        case "Result":
          this.displayResult = true;
          break;
        case "Centroids":
          this.displayCentroids = true;
          break;
        default:
        // TODO: catch error
      }
    },

    /**
     * Renders the original, greyscaled, centroid, and Vornoi diagram.
     */
    generateResult() {
      // TODO: Make the image fit to the div or vice versa.

      // Store all canvas elements that can be present on the page
      const canvas = ["canvas", "greyscaleCanvas", "centroidCanvas"];
      let centroids = [];

      // Clear all present canvas elements
      canvas.map(d => {
        const canvasElement = document.getElementById(d);
        const context = canvasElement.getContext("2d");
        context.clearRect(0, 0, d.width, d.height);
      });

      // Transfer the image to greyscale and compute the centroids
      uploadImage(this.image).then(imageData => {
        const originalImageData = {
          width: imageData.width,
          height: imageData.height,
          data: [...imageData.data]
        };
        const greyScaleImageData = greyScaleImage(imageData);
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
        const coloredCentroids = colorCentroidsByCoordinates(
          originalImageData,
          centroids
        );
        renderColoredVoronoi(
          coloredCentroids,
          imageData.width,
          imageData.height,
          4
        );
      });

      // Rescale the images to fit the page
      canvas.map(d => {
        const canvasElement = document.getElementById(d);
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
      });
    },

    generateEdges() {
      const canvas = ["canvas", "findEdges"];
      // Clear all present canvas elements
      canvas.map(d => {
        const canvasElement = document.getElementById(d);
        const context = canvasElement.getContext("2d");
        context.clearRect(0, 0, d.width, d.height);
      });

      // Transfer the image to greyscale and compute the centroids
      uploadImage(this.image).then(imageData => {
        const originalImageData = {
          width: imageData.width,
          height: imageData.height,
          data: [...imageData.data]
        };
        window.fastThreshold = 5;

        var doFindFeatures = function() {
          window.tracking.Fast.THRESHOLD = window.fastThreshold;

          var gray = window.tracking.Image.grayscale(
            imageData.data,
            imageData.width,
            imageData.height
          );
          var corners = window.tracking.Fast.findCorners(
            gray,
            imageData.width,
            imageData.height
          );
          let centroids = [{ x: 0, y: 0 }];
          for (let i = 0; i < corners.length; i += 2) {
            centroids.push({
              x: corners[i],
              y: corners[i + 1]
            });
          }
          const coloredCentroids = colorCentroidsByCoordinates(
            originalImageData,
            centroids
          );
          renderColoredVoronoi(coloredCentroids, imageData.width, imageData.height);
        };

        doFindFeatures();
      });

      // Rescale the images to fit the page
      canvas.map(d => {
        const canvasElement = document.getElementById(d);
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
      });
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
</style>
