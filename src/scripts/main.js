import { renderVoronoi } from "./knnLogic";
// import { renderVoronoiUsingD3, renderColoredVoronoi } from "./voronoiUsingD3";
import {
  uploadImage,
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "./imageHandler";

// Store all canvas elements that can be present on the page
const canvas = ["canvas", "greyscaleCanvas", "centroidCanvas"];
let centroids = [];

// Triggered whenever the user uploads an image
document.getElementById("inputfile").onchange = function() {
  // Clear all present canvas elements
  canvas.map(d => {
    const canvasElement = document.getElementById(d);
    const context = canvasElement.getContext("2d");
    context.clearRect(0, 0, d.width, d.height);
  });

  // Transfer the image to greyscale and compute the centroids
  uploadImage(this).then(imageData => {
    const originalImageData = {
      width: imageData.width,
      height: imageData.height,
      data: [...imageData.data]
    };
    const greyScaleImageData = greyScaleImage(imageData);
    centroids = [
      ...computeCentroidsFromGreyScale(greyScaleImageData, 0.8, false, 20, 10),
      ...computeCentroidsFromGreyScale(greyScaleImageData, 0.5, true, 20, 10)
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
};
