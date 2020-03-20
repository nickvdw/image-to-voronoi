require("tracking");
import { pruneCentroidsByMethod } from "../pointCloudLogic";
import { renderNaive } from "./renderNaive";

export const resultFromNaiveEdgesSobel = (
  originalImageData,
  threshold,
  displayEdges,
  displayCentroids,
  displayColour,
  croppedImageData,
  coordinateMargins,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  selectedCellColour,
  numberOfNeighbours,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  pruningClusterCount
) => {
  // Set the threshold for the number of corners to detect
  window.fastThreshold = threshold;
  window.tracking.Fast.THRESHOLD = window.fastThreshold;

  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

  // Grayscale the image
  const gray = window.tracking.Image.grayscale(
    imageData.data,
    imageData.width,
    imageData.height
  );

  // Grayscaling reduced the size of the pixel array to 1/4th, we need to reconstruct it
  let grayImageData = [];
  for (let i = 0; i < gray.length; i++) {
    grayImageData.push(gray[i], gray[i], gray[i], 255);
  }

  // Run Sobel edge detection on the image
  const edgePixels = window.tracking.Image.sobel(
    grayImageData,
    imageData.width,
    imageData.height
  );

  // Normalise all the values, as some values are over 255
  let max = 0;
  for (let i = 0; i < edgePixels.length; i += 4) {
    if (edgePixels[i] > max) {
      max = edgePixels[i];
    }
  }

  // Set x to be our iterative and normalise all values
  let x = 0;
  while (x < edgePixels.length) {
    edgePixels[x] = 255 * (edgePixels[x] / max);
    x += 4;
  }

  // Reset x and link each value to a coordinate under the array 'edges'
  let edges = [];
  x = 0;
  for (let i = 0; i < imageData.height; i++) {
    for (let j = 0; j < imageData.width; j++) {
      edges.push({
        x: j,
        y: i,
        colour: Math.round(edgePixels[x])
      });
      x += 4;
    }
  }

  // Centroids are now being made under a certain threshold condition (value over ...)
  let centroids = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].colour > threshold) {
      centroids.push({
        x: edges[i].x,
        y: edges[i].y
      });
    }
  }

  // Apply pruning
  centroids = pruneCentroidsByMethod(
    centroids,
    selectedPruningMethod,
    pruningThreshold,
    pruningDistance,
    pruningClusterCount
  );

  // Add margin to the centroids if we use the cropped image
  if (croppedImageData && coordinateMargins) {
    centroids = centroids.map(centroid => {
      return {
        x: centroid.x + coordinateMargins.width,
        y: centroid.y + coordinateMargins.height,
        colour: centroid.colour
      };
    });
  }

  const update = renderNaive(
    imageData,
    originalImageData,
    numberOfNeighbours,
    displayEdges,
    displayCentroids,
    selectedEdgeThickness,
    selectedEdgeColour,
    selectedCentroidSize,
    selectedCentroidColour,
    false,
    [],
    centroids
  );

  update();

  return update;
};
