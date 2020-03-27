import {
  greyScaleImage,
  computeCentroidsFromGreyScale
} from "@/scripts/imageHandler";
import { pruneCentroidsByMethod } from "../pointCloudLogic";
import { renderNaive } from "./renderNaive";

export const resultFromNaiveGreyscaling = (
  originalImageData,
  numberOfNeighbours,
  displayEdges,
  displayCentroids,
  displayColour,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  selectedCellColour,
  selectedGreyscaleThreshold,
  inverseThreshold,
  selectedGreyscaleX,
  selectedGreyscaleY,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  croppedImageData,
  coordinateMargins,
  toBeCroppedImageCoordinates,
  pruningClusterCount
) => {
  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

  // This copy is needed as the greyscaleImage method edits the data
  const imageDataCopy = {
    width: imageData.width,
    height: imageData.height,
    data: [...imageData.data]
  };

  // Greyscale the image
  const greyScaleImageData = greyScaleImage(imageDataCopy);

  // Compute the centroid based on the greyscaled intensities
  let centroids = [
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      inverseThreshold,
      selectedGreyscaleX,
      selectedGreyscaleY
    )
  ];

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

  update(croppedImageData, coordinateMargins, toBeCroppedImageCoordinates);

  return update;
};
