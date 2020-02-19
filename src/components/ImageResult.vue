<template>
  <v-card>
    <v-card-title class="indigo white--text">
      <span class="title">Result</span>
      <v-spacer />
    </v-card-title>

    <v-card-text>
      <v-row v-show="this.image" align="start" justify="center">
        <div id="voronoiResult" />
      </v-row>
      <!-- Stuff that should not be here in production -->
      <v-row v-show="this.image" align="start" justify="center">
        <canvas id="canvas" />
        <canvas id="greyscaleCanvas" />
        <canvas id="centroidCanvas" />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
// import { renderVoronoi } from "./scripts/knnLogic";

import {
  uploadImage,
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";

import {
  // renderVoronoiUsingD3,
  renderColoredVoronoi
} from "@/scripts/voronoiUsingD3";

export default {
  name: "ImageResult",

  props: {
    // Image needs to be of a File type
    image: File,
    hideResult: Boolean
  },

  watch: {
    image: function() {
      // Don't continue when there is no actual image
      if (!this.image) {
        // TODO: Clear previous image that was/is stored in voronoiResult
        return;
      }

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
        // renderVoronoi(centroids, imageData.width, imageData.height, 1);
        // renderVoronoi(coloredCentroids, imageData.width, imageData.height, 4);
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
    }
  }
};
</script>
