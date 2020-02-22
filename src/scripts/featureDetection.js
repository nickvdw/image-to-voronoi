require("tracking");
// require("tracking/build/data/face-min");

import { colorCentroidsByCoordinates } from "@/scripts/imageHandler";
import { renderColoredVoronoi } from "@/scripts/voronoiUsingD3";

export const findFeatures = originalImageData => {
  window.fastThreshold = 15;

  window.tracking.Fast.THRESHOLD = window.fastThreshold;
  const gray = window.tracking.Image.sobel(
    originalImageData.data,
    originalImageData.width,
    originalImageData.height
  );
  const corners = window.tracking.Fast.findCorners(
    gray,
    originalImageData.width,
    originalImageData.height
  );
  let centroids = [{ x: 0, y: 0 }];
  for (let i = 0; i < corners.length; i += 2) {
    centroids.push({
      x: corners[i],
      y: corners[i + 1]
    });
  }
  const coloredCentroids = colorCentroidsByCoordinates(
    originalImageData,
    centroids
  );
  renderColoredVoronoi(
    coloredCentroids,
    originalImageData.width,
    originalImageData.height
  );
};
