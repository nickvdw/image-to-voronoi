<template>
  <v-card
    class="fullHeight"
    style="display: flex; flex-direction: column;"
    elevation="12"
  >
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Image result</span>
      <v-spacer />
      <!-- TODO: Refactor to for loop -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            @click="editImage"
            v-on="on"
            icon
            :disabled="!configuration.selectedImage"
          >
            <v-icon>mdi-image-edit-outline</v-icon>
          </v-btn>
        </template>
        <span>Remove centroids</span>
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
    </v-card-title>

    <!-- Card content -->
    <v-card-text id="resultContainer" class="pa-0 ma-0" style="height: 100%">
      <v-row
        v-show="!this.configuration.selectedImage && !this.loading"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="subtitle-1 text-center" cols="12">
          Please select an image.
        </v-col>
      </v-row>
      <!-- Progress bar -->
      <v-row
        style="height: 100%"
        v-show="this.loading"
        class="fill-height"
        align-content="center"
        justify="center"
      >
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
      <!-- Image result  -->
      <div v-show="!this.loading && this.configuration.selectedImage">
        <fullscreen
          class="wrapper"
          :fullscreen.sync="fullscreen"
          ref="fullscreen"
          @change="fullscreenChange"
          background="#eee"
        >
          <!-- The image representing the result -->
          <div
            align="start"
            justify="center"
            ref="result"
            id="voronoiResult"
            v-show="!fullscreen && !dialog"
          />
          <div
            align="start"
            justify="center"
            ref="fullResult"
            id="voronoiFullResult"
            class="fullResult"
            v-show="fullscreen || dialog || saving"
          />
        </fullscreen>
      </div>
    </v-card-text>

    <!-- Dialog stuff -->
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card style="background-color: #ddd">
        <v-toolbar dark class="blue-grey darken-3 white--text" elevation="0">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            Select an area of centroids to remove
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="submitCrop">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <cropper
            class="cropper"
            id="cropper"
            ref="cropper"
            :src="croppedImage"
          ></cropper>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
require("tracking");

import { uploadImage, toImageDataUrl } from "@/scripts/imageHandler";
import { resultFromDelaunayCorners } from "@/scripts/delaunayBasedRendering/centroidsFromCorners";
import { resultFromDelaunayEdgesSobel } from "@/scripts/delaunayBasedRendering/centroidsFromEdgesSobel";
import { resultFromNaiveEdgesSobel } from "@/scripts/naiveRendering/centroidsFromEdgesSobel";
import { resultFromDelaunayGreyscaling } from "@/scripts/delaunayBasedRendering/centroidsFromGreyscaling";
import { resultFromDelaunayPoisson } from "@/scripts/delaunayBasedRendering/centroidsFromPoisson";
import { resultFromNaiveGreyscaling } from "@/scripts/naiveRendering/centroidsFromGreyscaling";

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
      originalImageData: [],
      centroids: [],
      fullscreen: false,
      dialog: false,
      saving: false,
      croppedImage: null,
      toBeCroppedImageCoordinates: null,
      update: null
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
          selectedPruningMethod: null,
          pruningThreshold: 90,
          pruningDistance: 10,
          displayEdges: false,
          displayCentroids: false,
          displayColour: true,
          croppedImageData: null,
          coordinateMargins: null,
          selectedNumberOfNeighbours: 1,
          selectedEdgeThickness: 1,
          selectedEdgeColour: null,
          selectedCentroidSize: 1,
          selectedCentroidColour: null,
          selectedCellColour: null,
          selectedPoissonDistance: 1,
          selectedSobelThreshold: 40,
          selectedGreyscaleThreshold: null,
          selectedGreyscaleX: null,
          selectedGreyscaleY: null,
          customColour: null,
          inverseThreshold: false
        };
      }
    }
  },
  watch: {
    loading: function() {
      if (this.loading) {
        this.$emit("loading", true);
      } else {
        this.$emit("loading", false);
      }
    },
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
        this.loading = false;
      } else {
        // Clear the previous image
        document.getElementById("voronoiResult").innerHTML = "";
        document.getElementById("voronoiFullResult").innerHTML = "";
      }
    }
  },
  methods: {
    async editImage() {
      this.dialog = true;
      console.log(
        document.getElementById("voronoiFullResult"),
        this.dialog,
        this.fullscreen,
        this.saving
      );
      this.croppedImage = await this.$html2canvas(this.$refs.fullResult, {
        type: "dataURL"
      });
    },
    submitCrop() {
      // Obtain the coordinates of the cropped image selection
      const { coordinates } = this.$refs.cropper.getResult();

      this.toBeCroppedImageCoordinates = {
        start: { x: coordinates.left, y: coordinates.top },
        end: {
          x: coordinates.left + coordinates.width,
          y: coordinates.top + coordinates.height
        }
      };

      this.generateResult({ title: "Update" });

      this.toBeCroppedImageCoordinates = null;

      this.dialog = false;
    },
    /**
     * Opens a prompt with which an image can be saved.
     */
    async saveImage() {
      // Convert the image from a div to a canvas element
      this.saving = true;
      const result = await this.$html2canvas(this.$refs.fullResult, {
        type: "dataURL"
      });
      this.saving = false;
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
      // Only display the result chosen by the user
      switch (choice.title) {
        case "Original image":
          this.setImage(this.originalImageData);
          break;
        case "Result":
          document.getElementById("voronoiFullResult").innerHTML = "";
          if (
            this.configuration.selectedAlgorithm === "Delaunay triangulation"
          ) {
            if (this.configuration.selectedMethod === "Corner detection") {
              this.update = resultFromDelaunayCorners(
                this.originalImageData,
                parseInt(this.configuration.selectedThreshold),
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.croppedImageData,
                this.configuration.coordinateMargins,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                this.configuration.selectedCellColour,
                this.toBeCroppedImageCoordinates,
                this.configuration.customColour,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            } else if (this.configuration.selectedMethod === "Edge detection") {
              this.update = resultFromDelaunayEdgesSobel(
                this.originalImageData,
                this.configuration.selectedSobelThreshold,
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.croppedImageData,
                this.configuration.coordinateMargins,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                this.configuration.selectedCellColour,
                this.toBeCroppedImageCoordinates,
                this.configuration.customColour,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            } else if (
              this.configuration.selectedMethod ===
              "Based on greyscale intensities"
            ) {
              this.update = resultFromDelaunayGreyscaling(
                this.originalImageData,
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.croppedImageData,
                this.configuration.coordinateMargins,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                this.configuration.selectedCellColour,
                this.configuration.selectedGreyscaleThreshold,
                this.configuration.selectedGreyscaleX,
                this.configuration.selectedGreyscaleY,
                this.toBeCroppedImageCoordinates,
                this.configuration.customColour,
                this.configuration.inverseThreshold,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            } else if (
              this.configuration.selectedMethod === "Poisson disc sampling"
            ) {
              this.update = resultFromDelaunayPoisson(
                this.originalImageData,
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.croppedImageData,
                this.configuration.coordinateMargins,
                this.configuration.selectedPoissonDistance,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                this.configuration.selectedCellColour,
                this.toBeCroppedImageCoordinates,
                this.configuration.customColour,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            } else {
              console.log("This method does not exist");
            }
          } else if (this.configuration.selectedAlgorithm === "Naive") {
            if (
              this.configuration.selectedMethod ===
              "Based on greyscale intensities"
            ) {
              resultFromNaiveGreyscaling(
                this.originalImageData,
                this.configuration.selectedNumberOfNeighbours,
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                // this.configuration.selectedCellColour,
                this.configuration.selectedGreyscaleThreshold,
                this.configuration.selectedGreyscaleX,
                this.configuration.selectedGreyscaleY,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            } else if (this.configuration.selectedMethod === "Edge detection") {
              resultFromNaiveEdgesSobel(
                this.originalImageData,
                this.configuration.selectedSobelThreshold,
                this.configuration.displayEdges,
                this.configuration.displayCentroids,
                this.configuration.displayColour,
                this.configuration.croppedImageData,
                this.configuration.coordinateMargins,
                this.configuration.selectedEdgeThickness,
                this.configuration.selectedEdgeColour,
                this.configuration.selectedCentroidSize,
                this.configuration.selectedCentroidColour,
                this.configuration.selectedCellColour,
                this.configuration.selectedNumberOfNeighbours,
                this.configuration.selectedPruningMethod,
                this.configuration.pruningThreshold,
                this.configuration.pruningDistance
              );
            }
          }
          break;
        case "Centroids":
          // TODO: We probably have to handle centroid stuff in the files used for generation the result since we have direct access to the centroids there
          break;
        case "Update":
          this.update(
            this.configuration.croppedImageData,
            this.configuration.coordinateMargins,
            this.toBeCroppedImageCoordinates
          );
          break;
        default:
        // TODO: catch error
      }
      this.croppedImage = null;
      this.croppedImageCoordinates = null;
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
.fullResult {
  display: inline-flex;
  overflow: auto;
}
</style>
