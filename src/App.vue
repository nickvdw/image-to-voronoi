<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-contact-mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
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
        <!-- <v-row align="start" justify="center">
          <v-img :src="image" />
        </v-row> -->
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import { renderVoronoi } from "./scripts/knnLogic";
import {
  uploadImage,
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "./scripts/imageHandler";
// import { renderVoronoiUsingD3, renderColoredVoronoi } from "./voronoiUsingD3";

export default {
  props: {
    source: String
  },

  data() {
    return {
      drawer: null,
      image: []
    };
  },

  methods: {
    uploadedImage() {
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
      uploadImage(document.getElementById("inputimage")).then(imageData => {
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
        renderVoronoi(coloredCentroids, imageData.width, imageData.height, 4);
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
