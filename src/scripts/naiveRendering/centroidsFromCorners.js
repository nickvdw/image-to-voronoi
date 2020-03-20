import { pruneCentroidsByMethod } from "../pointCloudLogic";
import { renderNaive } from "./renderNaive";

export const resultFromNaiveCorners = (
  originalImageData,
  threshold,
  numberOfNeighbours,
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
  toBeCroppedImageCoordinates,
  customColour,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  pruningClusterCount
) => {
  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

  // Set the threshold for the number of corners to detect
  window.fastThreshold = threshold;
  window.tracking.Fast.THRESHOLD = window.fastThreshold;

  // Grayscale the image
  const gray = window.tracking.Image.grayscale(
    imageData.data,
    imageData.width,
    imageData.height
  );

  // Find the corners in the grayscaled image using FAST
  const corners = window.tracking.Fast.findCorners(
    gray,
    imageData.width,
    imageData.height
  );

  // Store the centroids based on the corners
  let centroids = [];
  for (let i = 0; i < corners.length; i += 2) {
    centroids.push({
      x: corners[i],
      y: corners[i + 1]
    });
  }

  // Apply pruning
  centroids = pruneCentroidsByMethod(
    centroids,
    selectedPruningMethod,
    pruningThreshold,
    pruningDistance,
    pruningClusterCount
  );

  // Whether or not to randomly generate colours
  const generateRandomColours = false;

  // Map that contains a colour mapping: [x, y] => colour
  const colourMap = [];

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
    generateRandomColours,
    colourMap,
    centroids
  );

  update();

  return update;
};
