<template>
  <v-app id="inspire">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row align="start" justify="center">
          <v-file-input
            v-model="image"
            color="deep-purple accent-4"
            label="Image input"
            accept="image/*"
            placeholder="Select your image"
            prepend-icon="mdi-camera"
            outlined
            id="inputimage"
            @change="uploadedImage"
            :show-size="1000"
          />
        </v-row>
        <v-row align="start" justify="center">
          <div id="voronoiCanvas" />
        </v-row>
        <v-row align="start" justify="center">
          <div id="voronoiResult" />
        </v-row>
        <v-row align="start" justify="center">
          <canvas id="canvas" />
        </v-row>
        <v-row align="start" justify="center">
          <canvas id="greyscaleCanvas" />
        </v-row>
        <v-row align="start" justify="center">
          <canvas id="centroidCanvas" />
        </v-row>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; De Soyboys 2k20</span>
    </v-footer>
  </v-app>
</template>

<script>
// import { renderVoronoi } from "./scripts/knnLogic";

import {
  uploadImage,
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from './scripts/imageHandler';

import { densityDelete } from './scripts/pointCloudLogic';

import {
  // renderVoronoiUsingD3,
  renderColoredVoronoi
} from './scripts/voronoiUsingD3';

export default {
  data() {
    return {
      image: []
    };
  },

  methods: {
    uploadedImage() {
      // Store all canvas elements that can be present on the page
      const canvas = ['canvas', 'greyscaleCanvas', 'centroidCanvas'];
      let centroids = [];

      // Clear all present canvas elements
      canvas.map(d => {
        const canvasElement = document.getElementById(d);
        const context = canvasElement.getContext('2d');
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
            0.6,
            false,
            20,
            20
          ),
          ...computeCentroidsFromGreyScale(
            greyScaleImageData,
            0.8,
            true,
            10,
            10
          )
        ];
        // Sparsen the centroids
        console.log(centroids);
        densityDelete(centroids, 20);
        console.log(densityDelete(centroids, 20));

        const coloredCentroids = colorCentroidsByCoordinates(
          originalImageData,
          densityDelete(centroids, 20)
        );
        // renderVoronoi(centroids, imageData.width, imageData.height, 1);
        //renderVoronoi(coloredCentroids, imageData.width, imageData.height, 4);
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

<style>
html {
  overflow-y: auto !important;
}
</style>
