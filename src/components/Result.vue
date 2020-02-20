<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Result</span>
      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on }" v-slot:disabled="image">
          <v-btn dark icon v-on="on" :disabled="!image">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
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
            @click="renderResult(item)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <!-- Card content -->
    <v-card-text>
      <div v-show="!this.image && !this.loading">
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
        <!-- The image represneting the result -->
        <v-row v-show="this.image" align="start" justify="center">
          <div v-show="this.displayResult" id="voronoiResult" />
          <canvas v-show="this.displayCentroids" id="centroidCanvas" />
          <canvas v-show="this.displayOriginalImage" id="canvas" />
          <canvas v-show="this.displayGreyScaleImage" id="greyscaleCanvas" />
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  uploadImage,
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";

import { renderColoredVoronoi } from "@/scripts/voronoiUsingD3";

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
      displayOriginalImage: false,
      displayResult: false,
      displayCentroids: false,
      displayGreyScaleImage: false
    };
  },

  props: {
    // Image needs to be of a File type or null
    image: File
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
        this.displayResult = true;
      }
    }
  },

  methods: {
    /**
     * Renders the result based on the @choice picked by the user.
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
        // code block
      }
    },
    /**
     * Generates and stores the resulting image.
     */
    async generateResult() {
      // TODO: Make the image fit somehow

      // Store all canvas elements that can be present on the page
      const canvas = await ["canvas", "greyscaleCanvas", "centroidCanvas"];
      let centroids = await [];

      // Clear all present canvas elements
      await canvas.map(d => {
        const canvasElement = document.getElementById(d);
        const context = canvasElement.getContext("2d");
        context.clearRect(0, 0, d.width, d.height);
      });

      // Transfer the image to greyscale and compute the centroids
      await uploadImage(this.image).then(imageData => {
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
        // renderVoronoi(centroids, imageData.width, imageData.height, 1);
        // renderVoronoi(coloredCentroids, imageData.width, imageData.height, 4);
        renderColoredVoronoi(
          coloredCentroids,
          imageData.width,
          imageData.height,
          4
        );
      });

      await new Promise(r => setTimeout(r, 2000));

      // Rescale the images to fit the page
      await canvas.map(d => {
        const canvasElement = document.getElementById(d);
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
      });
    }
  }
};
</script>
