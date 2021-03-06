<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Configuration parameters</span>
      <v-spacer />
    </v-card-title>
    <!-- Card content -->
    <!-- Form -->
    <v-form ref="form" v-model="valid">
      <v-card-text class="pt-0 pb-0">
        <v-file-input
          v-model="selectedImage"
          color="blue-grey darken-3"
          label="Input image"
          accept="image/*"
          prepend-icon="mdi-camera"
          :show-size="1000"
          required
          class="mt-2"
          @change="uploadImage"
          :rules="imageRules"
        />
        <v-text-field
          color="blue-grey darken-3"
          :disabled="!selectedImage"
          :label="
            `Downscale image (original image width: ${this.imageSizes.width}px)`
          "
          v-model="downscaledWidth"
          clearable
          class="mb-2"
          :rules="downscaleImageRules"
          type="number"
          :hint="
            'This sets the new width of the image. This value is initially the original width of the image.'
          "
        />
        <!-- <v-btn
          small
          outlined
          block
          color="blue-grey darken-3"
          class="white--text mt-2"
        >
          Take a picture with your webcam
        </v-btn> -->
        <v-btn
          :disabled="!selectedImage"
          small
          outlined
          block
          @click="dialog = true"
          color="blue-grey darken-3"
          class="white--text mt-4"
        >
          Select an important region
        </v-btn>
        <!-- <v-divider class="mt-4 mb-4" /> -->
      </v-card-text>
      <!-- Image upload field -->
      <v-tabs
        background-color="blue-grey darken-3"
        dark
        height="45"
        class="mt-4"
        v-model="currentTab"
        grow
      >
        <v-tab v-for="tabItem in tabItems" :key="tabItem">
          {{ tabItem }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="currentTab">
        <v-tab-item>
          <v-card flat>
            <v-card-text class="pt-0">
              <!-- TODO: Render these in a for loop -->
              <v-checkbox
                color="blue-grey darken-3"
                v-model="displayEdges"
                label="Display the edges"
                hide-details
              />
              <v-text-field
                v-if="displayEdges"
                v-model="selectedEdgeColour"
                v-mask="edgeColourMask"
                hide-details
                class="mt-4 ml-4"
                solo
              >
                <template v-slot:append>
                  <v-menu
                    v-model="edgeColourMenu"
                    top
                    nudge-bottom="105"
                    nudge-left="16"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ on }">
                      <div :style="swatchStyleEdgeColour" v-on="on" />
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <!-- v-model should be changed to :value but this
                        does not work with the fext field and div above -->
                        <v-color-picker
                          v-model="selectedEdgeColour"
                          flat
                          hide-inputs
                        />
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
              </v-text-field>
              <v-text-field
                v-if="displayEdges"
                color="blue-grey darken-3"
                label="Edge thickness"
                class="mt-4 ml-4"
                v-model="selectedEdgeThickness"
                :rules="edgeThicknessRules"
                type="number"
              />
              <v-checkbox
                color="blue-grey darken-3"
                v-model="displayCentroids"
                label="Display the centroids"
                hide-details
              />
              <v-text-field
                v-if="displayCentroids"
                v-model="selectedCentroidColour"
                v-mask="centroidColourMask"
                hide-details
                class="ma-0 pa-0 mt-4 ml-4"
                solo
              >
                <template v-slot:append>
                  <v-menu
                    v-model="centroidColourMenu"
                    top
                    nudge-bottom="105"
                    nudge-left="16"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ on }">
                      <div :style="swatchStyleCentroidColour" v-on="on" />
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <v-color-picker
                          v-model="selectedCentroidColour"
                          flat
                          hide-inputs
                        />
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
              </v-text-field>
              <v-text-field
                v-if="displayCentroids"
                color="blue-grey darken-3"
                label="Centroid size"
                class="mt-4 ml-4"
                v-model="selectedCentroidSize"
                :rules="centroidSizeRules"
                type="number"
              />
              <v-checkbox
                color="blue-grey darken-3"
                v-model="displayColour"
                label="Colour the cells"
                hide-details
              />
              <v-checkbox
                color="blue-grey darken-3"
                class="ml-4"
                v-if="displayColour"
                v-model="customColour"
                label="Custom colour"
                hide-details
              />
              <v-text-field
                v-if="customColour"
                v-model="selectedCellColour"
                v-mask="cellColourMask"
                hide-details
                class="ma-0 pa-0 mt-4 ml-8"
                solo
              >
                <template v-slot:append>
                  <v-menu
                    v-model="cellColourMenu"
                    top
                    nudge-bottom="105"
                    nudge-left="16"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ on }">
                      <div :style="swatchStyleCellColour" v-on="on" />
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <v-color-picker
                          v-model="selectedCellColour"
                          flat
                          hide-inputs
                        />
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-card-text class="pt-0">
              <!-- Algorithms to use -->
              <v-select
                class="mt-4"
                color="blue-grey darken-3"
                item-color="blue-grey darken-4"
                :items="algorithms"
                v-model="selectedAlgorithm"
                label="Algorithm"
                required
                hint="This algorithms will be used to generate the result."
                :rules="algorithmRules"
              />
              <!-- Number of nearest neighbours -->
              <v-text-field
                color="blue-grey darken-3"
                label="Number of nearest neighbours"
                v-show="this.selectedAlgorithm === 'Naive'"
                v-model="selectedNumberOfNeighbours"
                class="ml-4"
                :rules="numberOfNeighboursRules"
                type="number"
              />
              <!-- Field to select method for centroid generation -->
              <v-select
                color="blue-grey darken-3"
                item-color="blue-grey darken-4"
                :items="
                  selectedAlgorithm === 'Delaunay triangulation'
                    ? delaunayMethods
                    : naiveMethods
                "
                v-model="selectedMethod"
                label="Method for centroid generation"
                required
                :rules="methodRules"
                hint="This method will be used for picking the centroids."
              />
              <!-- Threshold for number of centroids -->
              <v-text-field
                color="blue-grey darken-3"
                label="Threshold"
                v-show="this.selectedMethod === 'Corner detection'"
                v-model="selectedThreshold"
                :rules="thresholdRules"
                class="ml-4"
                type="number"
                hint="A lower threshold results in more centroids."
              />
              <!-- Minimum radius for poissoin disc sampling -->
              <v-text-field
                color="blue-grey darken-3"
                label="Minimum distance for between points"
                v-show="this.selectedMethod === 'Poisson disc sampling'"
                v-model="selectedPoissonDistance"
                :rules="poissonDistanceRules"
                type="number"
                class="ml-4"
                hint="The minimum distance (in pixels) between points when using poisson disc sampling."
              />
              <!-- Threshold for sobel edges -->
              <v-text-field
                color="blue-grey darken-3"
                label="Threshold"
                v-show="this.selectedMethod === 'Edge detection'"
                v-model="selectedSobelThreshold"
                :rules="sobelThresholdRules"
                class="ml-4"
                type="number"
              />
              <v-text-field
                color="blue-grey darken-3"
                label="Threshold"
                v-show="
                  this.selectedMethod === 'Based on greyscale intensities'
                "
                v-model="selectedGreyscaleThreshold"
                :rules="greyscaleThresholdRules"
                type="number"
                class="ml-4"
                hide-details
              />
              <v-checkbox
                color="blue-grey darken-3"
                class="mb-4 ml-4"
                v-show="
                  this.selectedMethod === 'Based on greyscale intensities'
                "
                v-model="inverseThreshold"
                label="Inverse threshold"
                hide-details
              />
              <v-text-field
                color="blue-grey darken-3"
                label="Skip x-axis pixels"
                v-show="
                  this.selectedMethod === 'Based on greyscale intensities'
                "
                v-model="selectedGreyscaleX"
                :rules="sobelThresholdRules"
                type="number"
                class="ml-4"
              />
              <v-text-field
                color="blue-grey darken-3"
                label="Skip y-axis pixels"
                v-show="
                  this.selectedMethod === 'Based on greyscale intensities'
                "
                v-model="selectedGreyscaleY"
                :rules="sobelThresholdRules"
                type="number"
                class="ml-4"
              />
              <!-- Field to select method for centroid pruning -->
              <v-select
                color="blue-grey darken-3"
                item-color="blue-grey darken-4"
                :items="pruningMethods"
                v-model="selectedPruningMethod"
                label="Method for pruning centroids"
                hint="This method will be used to prune centroids."
              />
              <!-- Threshold percentage for centroid pruning -->
              <v-text-field
                color="blue-grey darken-3"
                label="Pruning Threshold"
                v-show="this.selectedPruningMethod === 'Random'"
                v-model="pruningThreshold"
                :rules="pruningThresholdRules"
                type="number"
                class="ml-4"
              />
              <v-text-field
                color="blue-grey darken-3"
                label="Pruning distance"
                v-show="this.selectedPruningMethod === 'Distance-based'"
                v-model="pruningDistance"
                :rules="distanceThresholdRules"
                type="number"
                hint="Centroids with a lower distance to another will be pruned."
                class="ml-4"
              />
              <v-text-field
                color="blue-grey darken-3"
                label="Number of clusters (centroids)"
                v-show="this.selectedPruningMethod === 'Cluster-based'"
                v-model="pruningClusterCount"
                :rules="clusterRules"
                type="number"
                hide-details
                class="ml-4"
              />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-form>

    <v-divider />
    <!-- Reset and submit button group -->
    <v-card-actions>
      <v-row align="center" justify="space-around">
        <v-btn color="error" @click="reset">Reset</v-btn>
        <v-btn
          class="blue-grey darken-3 white--text"
          :loading="isLoading"
          :disabled="!valid"
          @click="validate"
        >
          Submit
        </v-btn>
      </v-row>
    </v-card-actions>

    <!-- Dialog stuff -->
    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="headline"
          >Select the important region</v-card-title
        >
        <v-card-text>
          <cropper class="cropper" ref="cropper" :src="croppedImage" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn color="green darken-1" text @click="submitCrop">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { uploadImage } from "@/scripts/imageHandler";
import { Cropper } from "vue-advanced-cropper";
import { mask } from "vue-the-mask";
export default {
  name: "Menu",
  directives: { mask },
  data: () => ({
    // Cropped image
    croppedImage: null,
    // Image data of the cropped image
    imageData: null,
    coordinateMargins: null,
    // Initial image and associated rules
    selectedImage: null,
    imageRules: [v => (!!v && v !== []) || "An image is required"],
    // Available methods for the centroid generation and associated rules
    delaunayMethods: [
      "Corner detection",
      "Edge detection",
      "Based on greyscale intensities",
      "Poisson disc sampling"
    ],
    naiveMethods: [
      "Based on greyscale intensities",
      "Edge detection",
      "Corner detection",
      "Poisson disc sampling"
    ],
    methodRules: [v => !!v || "A method is required"],
    selectedMethod: "Edge detection",
    // Available methods for centroid pruning
    pruningMethods: [
      "Random",
      "Even",
      "Distance-based",
      "Cluster-based",
      "None"
    ],
    // % of centroids to prune 0 - 100
    pruningThreshold: 90,
    pruningDistance: 10,
    selectedPruningMethod: "Random",
    pruningClusterCount: 250,
    // Available methods for the algorithms and associated rules
    algorithms: ["Naive", "Delaunay triangulation"],
    algorithmRules: [v => !!v || "An algorithm is required"],
    selectedAlgorithm: "Delaunay triangulation",
    // Selected threshold and associated rules
    selectedThreshold: 40,
    thresholdRules: [
      v =>
        (!!v && v <= 255 && v >= 0) ||
        "A threshold of at least 0 and at most 255 is required"
    ],
    pruningThresholdRules: [
      v =>
        (!!v && v <= 100 && v >= 0) ||
        "A threshold of at least 0 and at most 100 is required"
    ],
    distanceThresholdRules: [
      v =>
        (!!v && v <= 500 && v >= 0) ||
        "A threshold of at least 0 and at most 500 is required"
    ],
    clusterRules: [
      v =>
        (!!v && v <= 5000 && v >= 1) ||
        "A threshold of at least 1 and at most 5000 is required"
    ],

    // Selected thickness and colour for edges with associated rules
    selectedEdgeThickness: 0.1,
    edgeThicknessRules: [
      v =>
        (!!v && v <= 20 && v > 0) ||
        "A thickness of at least 0.x and at most 20 is required"
    ],
    selectedEdgeColour: "#000000FF",
    edgeColourMask: "!#XXXXXXXX",
    edgeColourMenu: false,
    // Selected size and colour for centroids with associated rules
    selectedCentroidSize: 1,
    centroidSizeRules: [
      v =>
        (!!v && v <= 20 && v >= 1) ||
        "A size of at least 1 and at most 20 is required"
    ],
    selectedCentroidColour: "#000000FF",
    centroidColourMenu: false,
    centroidColourMask: "!#XXXXXXXX",
    selectedCellColour: "#000000FF",
    cellColourMenu: false,
    cellColourMask: "!#XXXXXXXX",
    displayEdges: false,
    displayCentroids: false,
    displayColour: true,
    customColour: null,
    inverseThreshold: false,
    selectedNumberOfNeighbours: 1,
    numberOfNeighboursRules: [
      v =>
        (!!v && v <= 30 && v >= 1) ||
        "The number of nearest neighbours should be between 1 and 30"
    ],
    selectedPoissonDistance: 20,
    poissonDistanceRules: [
      v =>
        (!!v && v <= 2000 && v >= 1) ||
        "The distance should be between 1 and 2000 pixels."
    ],
    selectedSobelThreshold: 50,
    sobelThresholdRules: [
      v =>
        (!!v && v >= 0 && v <= 255) ||
        "The threshold should be between 0 and 255."
    ],
    selectedGreyscaleThreshold: 0.5,
    greyscaleThresholdRules: [
      v =>
        (!!v && v >= 0 && v <= 1) || "The threshold should be between 0 and 1."
    ],
    selectedGreyscaleX: 1,
    selectedGreyscaleY: 1,
    // Whether or not the form is valid
    valid: false,
    dialog: false,
    // All tabs
    tabItems: ["Display", "Methods"],
    currentTab: "Display",
    isLoading: false,
    imageSizes: { width: 0, height: 0 },
    downscaledWidth: 0,
    downscaleImageRules: [
      v =>
        (!!v && v <= 0 && v >= 1) ||
        `A width of at least 1 and at most 0 pixels is required.`
    ]
  }),
  components: {
    Cropper
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    loading() {
      this.isLoading = this.loading;
    }
  },
  computed: {
    swatchStyleEdgeColour() {
      const { selectedEdgeColour, edgeColourMenu } = this;
      return {
        backgroundColor: selectedEdgeColour,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: edgeColourMenu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out"
      };
    },
    swatchStyleCellColour() {
      const { selectedCellColour, cellColourMenu } = this;
      return {
        backgroundColor: selectedCellColour,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: cellColourMenu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out"
      };
    },
    swatchStyleCentroidColour() {
      const { selectedCentroidColour, centroidColourMenu } = this;
      return {
        backgroundColor: selectedCentroidColour,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: centroidColourMenu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out"
      };
    }
  },
  methods: {
    submitCrop() {
      // Obtain the coordinates of the cropped image selection
      const {
        coordinates,
        canvas: cropperCanvas
      } = this.$refs.cropper.getResult();
      // We create this canvas so that we never overwrite the OG image in the region selector
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.downscaledWidth) {
        console.log("Downscale + region selected");

        const image = new Image();
        // This is the full image
        image.src = this.croppedImage;
        image.onload = () => {
          let downscaledHeight = Math.floor(
            image.height * (this.downscaledWidth / image.width)
          );

          // Downscaled coordinates of the cropper
          let downscaledCoordinates = {
            width: Math.floor(
              (coordinates.width / image.width) * this.downscaledWidth
            ),
            height: Math.floor(
              (coordinates.height / image.height) * downscaledHeight
            ),
            left: Math.floor(
              (coordinates.left / image.width) * this.downscaledWidth
            ),
            top: Math.floor((coordinates.top / image.height) * downscaledHeight)
          };
          canvas.height = downscaledHeight;
          canvas.width = this.downscaledWidth;
          console.log(downscaledCoordinates);
          console.log(coordinates);
          console.log(image.width, image.height);
          // Draw the downscaled image
          ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            0,
            0,
            this.downscaledWidth,
            downscaledHeight
          );
          console.log(this.downscaledWidth, downscaledHeight);
          console.log(canvas.toDataURL());

          // Get the important region from the downscaled image
          this.imageData = ctx.getImageData(
            downscaledCoordinates.left,
            downscaledCoordinates.top,
            downscaledCoordinates.width,
            downscaledCoordinates.height
          );

          this.coordinateMargins = {
            width: downscaledCoordinates.left,
            height: downscaledCoordinates.top
          };
        };
      } else {
        console.log("only 1");
        const ctx = cropperCanvas.getContext("2d");
        this.imageData = ctx.getImageData(
          0,
          0,
          coordinates.width,
          coordinates.height
        );
        this.coordinateMargins = {
          width: coordinates.left,
          height: coordinates.top
        };
      }

      this.dialog = false;
    },
    async uploadImage() {
      let input = event.target;

      if (input.files) {
        // create a new FileReader to read this image and convert to base64 format
        const reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = e => {
          this.croppedImage = e.target.result;
        };

        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0]);
      }

      const result = await uploadImage(this.selectedImage, 0);
      this.imageSizes = {
        width: result.width,
        height: result.height
      };
      this.downscaledWidth = this.imageSizes.width;

      this.downscaleImageRules = [
        v =>
          (!!v && v <= this.imageSizes.width && v >= 1) ||
          `A width of at least 1 and at most ${this.imageSizes.width} pixels is required.`
      ];
    },
    /**
     * Validates whether or not the form is valid (i.e., all REQUIRED
     * parameters have been filled in).
     *
     * Emits the form data if the form is valid.
     */
    validate() {
      this.isLoading = true;
      if (this.$refs.form.validate()) {
        this.$emit("submit", {
          selectedImage: this.selectedImage,
          downscaledWidth: this.downscaledWidth,
          selectedAlgorithm: this.selectedAlgorithm,
          selectedMethod: this.selectedMethod,
          selectedThreshold: this.selectedThreshold,
          displayEdges: this.displayEdges,
          displayCentroids: this.displayCentroids,
          displayColour: this.displayColour,
          croppedImageData: this.imageData,
          coordinateMargins: this.coordinateMargins,
          selectedNumberOfNeighbours: this.selectedNumberOfNeighbours,
          selectedEdgeThickness: this.selectedEdgeThickness,
          selectedEdgeColour: this.selectedEdgeColour,
          selectedCentroidSize: this.selectedCentroidSize,
          selectedCentroidColour: this.selectedCentroidColour,
          selectedCellColour: this.selectedCellColour,
          selectedPoissonDistance: this.selectedPoissonDistance,
          selectedSobelThreshold: this.selectedSobelThreshold,
          selectedGreyscaleThreshold: this.selectedGreyscaleThreshold,
          selectedGreyscaleX: this.selectedGreyscaleX,
          selectedGreyscaleY: this.selectedGreyscaleY,
          customColour: this.customColour,
          inverseThreshold: this.inverseThreshold,
          pruningThreshold: this.pruningThreshold,
          pruningDistance: this.pruningDistance,
          selectedPruningMethod: this.selectedPruningMethod,
          pruningClusterCount: this.pruningClusterCount
        });
      }
    },
    /**
     * Resets (i.e., clears) the form data.
     *
     * Emits meaningless form data to indicate there is no image anymore.
     */
    reset() {
      // Reset all form inputs
      // this.$refs.form.reset();
      // Emit a submit event with a rest flag to the toolpage
      this.$emit("submit", "reset");

      // Reset everything regarding the image
      this.selectedImage = null;
      this.downscaledWidth = 0;
      this.downscaleImageRules = [];
      this.imageSizes.width = 0;
      this.imageSizes.heigth = 0;

      // Reset other stuff back to defaults
      this.selectedAlgorithm = "Delaunay triangulation";
      this.selectedMethod = "Edge detection";
      this.selectedPruningMethod = "Random";
      this.imageData = null;

      this.displayEdges = false;
      this.displayCentroids = false;
      this.customColour = false;
      this.selectedSobelThreshold = 50;
      this.selectedThreshold = 50;
      this.selectedNumberOfNeighbours = 1;
      this.selectedEdgeThickness = 1;
      this.selectedCentroidSize = 1;
      this.currentTab = "Display";
      this.displayColour = false;
      this.displayColour = true;
      this.pruningThreshold = 80;
      this.pruningDistance = 10;
      this.valid = true;
    }
  }
};
</script>

<style>
.cropper {
  background: #ddd;
  height: 100% !important;
}
/* This removes the animation but also the weird popup */
.v-window__container {
  height: 100% !important;
}

.vue-advanced-cropper__area {
  height: 100% !important;
}
</style>
