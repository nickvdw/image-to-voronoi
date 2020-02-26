<template>
  <v-card elevation="12">
    <!-- Card title -->
    <v-card-title class="blue-grey darken-3 white--text">
      <span class="title">Configuration</span>
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
                :menu-props="{ bottom: true, offsetY: true }"
                hint="This algorithms will be used to generate the result."
                :rules="algorithmRules"
              />
              <!-- Field to select method for centroid generation -->
              <v-select
                :menu-props="{ bottom: true, offsetY: true }"
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
              <v-text-field
                color="blue-grey darken-3"
                label="Number of nearest neighbours"
                v-model="selectedNumberOfNeighbours"
                :rules="numberOfNeighboursRules"
                type="number"
              />
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-expansion-panels flat accordion>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Edge options
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-checkbox
                    color="blue-grey darken-3"
                    v-model="displayEdges"
                    label="Display the edges"
                  />
                  <v-color-picker
                    hide-inputs
                    :value="selectedEdgeColour"
                    flat
                  />
                  <v-text-field
                    color="blue-grey darken-3"
                    label="Edge thickness"
                    class="ml-4 mr-4"
                    v-model="selectedEdgeThickness"
                    :rules="edgeThicknessRules"
                    type="number"
                    hint="The thickness of the edges in pixels"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Centroid options
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-checkbox
                    color="blue-grey darken-3"
                    v-model="displayCentroids"
                    label="Display the centroids"
                  />
                  <v-color-picker
                    :value="selectedCentroidColour"
                    hide-inputs
                    flat
                  />
                  <v-text-field
                    color="blue-grey darken-3"
                    label="Centroid size"
                    class="ml-4 mr-4"
                    v-model="selectedCentroidSize"
                    :rules="centroidSizeRules"
                    type="number"
                    hint="The size of the centroid in pixels"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Cell options
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-checkbox
                    color="blue-grey darken-3"
                    v-model="displayColour"
                    label="Colour the cells"
                  />
                  <v-color-picker
                    :value="selectedCellColour"
                    hide-inputs
                    flat
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
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
          :disabled="!valid"
          class="blue-grey darken-3 white--text"
          @click="validate"
        >
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

export default {
  name: "Menu",

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
      "Random"
    ],
    naiveMethods: [
      "Corner detection",
      "Edge detection",
      "Based on greyscale intensities",
      "Random"
    ],
    methodRules: [v => !!v || "A method is required"],
    // TODO: Remove initialisation
    selectedMethod: "",

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
    selectedEdgeColour: null,

    // Selected size and colour for centroids with associated rules
    selectedCentroidSize: 1,
    centroidSizeRules: [
      v =>
        (!!v && v <= 20 && v >= 1) ||
        "A thickness of at least 1 and at most 20 is required"
    ],
    selectedCentroidColour: null,

    selectedCellColour: null,

    displayEdges: false,
    displayCentroids: false,
    displayColour: true,

    selectedNumberOfNeighbours: 1,
    numberOfNeighboursRules: [
      v =>
        (!!v && v <= 30 && v >= 1) ||
        "The number of nearest neighbours should be between 1 and 30"
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
          selectedCellColour: this.selectedCellColour
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
