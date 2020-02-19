<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="indigo white--text">
      <span class="title">Result</span>
      <v-spacer />
    </v-card-title>

    <!-- Card content -->
    <v-card-text>
      <!-- Progress bar -->
      <div v-show="this.loading">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col class="subtitle-1 text-center" cols="12">
            Generating the result
          </v-col>
          <v-col cols="6">
            <v-progress-linear
              color="deep-purple accent-4"
              indeterminate
              rounded
              height="12"
            ></v-progress-linear>
          </v-col>
        </v-row>
      </div>
      <!-- Image result  -->
      <div v-show="!this.loading">
        <!-- The image represneting the result -->
        <v-row v-show="this.image" align="start" justify="center">
          <div id="voronoiResult" />
        </v-row>

        <!-- Stuff that should not be here in production -->
        <v-row v-show="this.image" align="start" justify="center">
          <canvas id="canvas" />
          <canvas id="greyscaleCanvas" />
          <canvas id="centroidCanvas" />
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
  name: "ImageResult",

  data() {
    return {
      loading: false
    };
  },

  props: {
    // Image needs to be of a File type
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
      }
    }
  },

  methods: {
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
