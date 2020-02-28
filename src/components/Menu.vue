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
      <!-- Image upload field -->
      <v-tabs v-model="currentTab" grow color="blue-grey darken-3">
        <v-tab v-for="tabItem in tabItems" :key="tabItem">
          {{ tabItem }}
        </v-tab>
      </v-tabs>
      <!-- TODO: Discuss "vertical" option, which is interesting -->
      <v-tabs-items v-model="currentTab">
        <v-tab-item>
          <v-card flat>
            <v-card-text class="pt-2">
              <v-file-input
                v-model="selectedImage"
                color="blue-grey darken-3"
                label="Input image"
                accept="image/*"
                prepend-icon="mdi-camera"
                :show-size="1000"
                required
                @change="uploadImage"
                :rules="imageRules"
              />
              <v-btn
                small
                outlined
                block
                color="blue-grey darken-3"
                class="white--text"
              >
                Take a picture with your webcam
              </v-btn>
              <v-btn
                :disabled="!selectedImage"
                small
                outlined
                block
                color="blue-grey darken-3"
                class="white--text mt-4"
                @click="cropImage"
              >
                Select an important region
              </v-btn>
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
                hint="The minimum distance (in pixels) between points when using poisson disc sampling."
              />
              <!-- Number of nearest neighbours -->
              <v-text-field
                color="blue-grey darken-3"
                label="Number of nearest neighbours"
                v-show="this.selectedAlgorithm === 'Naive'"
                v-model="selectedNumberOfNeighbours"
                :rules="numberOfNeighboursRules"
                type="number"
              />
              <!-- Threshold for sobel edges -->
              <v-text-field
                color="blue-grey darken-3"
                label="Threshold"
                v-show="this.selectedMethod === 'Edge detection'"
                v-model="selectedSobelThreshold"
                :rules="sobelThresholdRules"
                type="number"
              />
            </v-card-text>
          </v-card>
        </v-tab-item>
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
                class="mt-4"
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
                class="mt-4"
                v-model="selectedEdgeThickness"
                :rules="edgeThicknessRules"
                type="number"
                hide-details
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
                class="ma-0 pa-0 mt-4"
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
                class="mt-4"
                v-model="selectedCentroidSize"
                :rules="centroidSizeRules"
                type="number"
                hide-details
              />

              <v-checkbox
                color="blue-grey darken-3"
                v-model="displayColour"
                label="Colour the cells"
                hide-details
              />
              <v-text-field
                v-if="displayColour"
                v-model="selectedCellColour"
                v-mask="cellColourMask"
                hide-details
                class="ma-0 pa-0 mt-4"
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
      </v-tabs-items>
    </v-form>

    <v-divider />
    <!-- Reset and submit button group -->
    <v-card-actions>
      <v-row align="center" justify="space-around">
        <v-btn color="error" @click="reset">Reset</v-btn>
        <v-btn class="blue-grey darken-3 white--text" @click="validate">
          Submit
        </v-btn>
      </v-row>
    </v-card-actions>

    <!-- Dialog stuff -->
    <v-dialog v-model="dialog" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="headline"
          >Select the important region</v-card-title
        >
        <v-card-text>
          <cropper class="cropper" ref="cropper" :src="croppedImage"></cropper>
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
      "Corner detection",
      "Edge detection",
      "Based on greyscale intensities",
      "Poisson disc sampling"
    ],
    methodRules: [v => !!v || "A method is required"],
    // TODO: Remove initialisation
    selectedMethod: "Corner detection",

    // Available methods for the algorithms and associated rules
    algorithms: ["Naive", "Delaunay triangulation"],
    algorithmRules: [v => !!v || "An algorithm is required"],
    // TODO: Remove initialisation
    selectedAlgorithm: "Delaunay triangulation",

    // Selected threshold and associated rules
    selectedThreshold: 5,
    thresholdRules: [
      v =>
        (!!v && v <= 100 && v >= 0) ||
        "A threshold of at least 0 and at most 100 is required"
    ],

    // Selected thickness and colour for edges with associated rules
    selectedEdgeThickness: 1,
    edgeThicknessRules: [
      v =>
        (!!v && v <= 20 && v >= 1) ||
        "A thickness of at least 1 and at most 20 is required"
    ],
    selectedEdgeColour: "#000000FF",
    edgeColourMask: "!#XXXXXXXX",
    edgeColourMenu: false,

    // Selected size and colour for centroids with associated rules
    selectedCentroidSize: 1,
    centroidSizeRules: [
      v =>
        (!!v && v <= 20 && v >= 1) ||
        "A thickness of at least 1 and at most 20 is required"
    ],
    selectedCentroidColour: "#000000FF",
    centroidColourMenu: false,
    centroidColourMask: "!#XXXXXXXX",

    selectedCellColour: "#000000FF",
    cellColourMenu: false,
    cellColourMask: "!#XXXXXXXX",

    displayEdges: false,
    displayCentroids: false,
    displayColour: false,

    selectedNumberOfNeighbours: 1,
    numberOfNeighboursRules: [
      v =>
        (!!v && v <= 30 && v >= 1) ||
        "The number of nearest neighbours should be between 1 and 30"
    ],

    selectedPoissonDistance: 1,
    poissonDistanceRules: [
      v =>
        (!!v && v <= 2000 && v >= 1) ||
        "The distance should be between 1 and 2000 pixels."
    ],

    selectedSobelThreshold: 40,
    sobelThresholdRules: [
      v =>
        (!!v && v >= 0 && v <= 255) ||
        "The threshold should be between 0 and 255."
    ],

    // Whether or not the form is valid
    valid: false,
    dialog: false,

    // All tabs
    tabItems: ["Image", "Methods", "Display"],
    currentTab: "Image"
  }),

  components: {
    Cropper
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
      const { coordinates, canvas } = this.$refs.cropper.getResult();

      const ctx = canvas.getContext("2d");
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

      this.dialog = false;
    },
    uploadImage() {
      var input = event.target;

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
    },

    change({ coordinates }) {
      this.croppedCoordinates = coordinates;
    },
    cropImage() {
      this.dialog = true;
    },
    /**
     * Validates whether or not the form is valid (i.e., all REQUIRED
     * parameters have been filled in).
     *
     * Emits the form data if the form is valid.
     */
    validate() {
      if (this.$refs.form.validate()) {
        this.$emit("submit", {
          selectedImage: this.selectedImage,
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
          selectedSobelThreshold: this.selectedSobelThreshold
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
      this.$refs.form.reset();
      // Emit a submit event with a rest flag to the toolpage
      this.$emit("submit", "reset");
      // We have to set the default threshold again because it is removed after the reset
      this.selectedThreshold = 10;
      this.selectedNumberOfNeighbours = 1;
      this.selectedEdgeThickness = 1;
      this.selectedCentroidSize = 1;
      this.currentTab = "Image";
    }
  }
};
</script>

<style>
.cropper {
  background: #ddd;
}

/* This removes the animation but also the weird popup */
.v-window__container {
  height: 100% !important;
}
</style>
