import { pruneCentroidsByMethod } from "../pointCloudLogic";
import { renderNaive } from "./renderNaive";
import { poissonDiscSampler } from "../delaunayBasedRendering/centroidsFromPoisson";

export const resultFromNaivePoisson = (
  originalImageData,
  displayEdges,
  displayCentroids,
  displayColour,
  croppedImageData,
  coordinateMargins,
  poissonDistance,
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
  pruningClusterCount,
  numberOfNeighbours
) => {
  // Compute centroids basied on poisson disc sampling with a certain radius (distance)
  let centroids = [
    ...poissonDiscSampler(
      0,
      0,
      originalImageData.width,
      originalImageData.height,
      poissonDistance
    )
  ];

  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
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
