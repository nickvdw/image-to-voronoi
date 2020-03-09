import * as d3 from "d3";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colourCentroidsByCoordinates
} from "@/scripts/imageHandler";
import { pruneCentroidsByMethod } from "../pointCloudLogic";

export const resultFromNaiveGreyscaling = (
  imageData,
  numberOfNeighbours,
  displayEdges,
  displayCentroids,
  displayColour,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  // selectedCellColour
  selectedGreyscaleThreshold,
  selectedGreyscaleX,
  selectedGreyscaleY,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance
) => {
  // I am still not sure why, but this is needed for the colours
  const imageDataCopy = {
    ...imageData,
    data: [...imageData.data]
  };

  const k = numberOfNeighbours;

  // Greyscale the image
  const greyScaleImageData = greyScaleImage(imageDataCopy);

  // Compute the centroid based on the greyscaled intensities
  // TODO: Create parameters in the UI for these options
  let centroids = [
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      false,
      selectedGreyscaleX,
      selectedGreyscaleY
    )
    // ...computeCentroidsFromGreyScale(greyScaleImageData, 0.5, true, 20, 10)
  ];

  // Apply pruning
  centroids = pruneCentroidsByMethod(
    centroids,
    selectedPruningMethod,
    pruningThreshold,
    pruningDistance
  );

  // Obtain colours for the centroids
  const colouredCentroids = colourCentroidsByCoordinates(imageData, centroids);

  // Construct the result
  // TODO: Handle the cases for @displayEdges and @displayCentroids
  console.log(displayEdges, displayCentroids);

  // Create SVG element
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
    .attr("width", imageData.width)
    .attr("height", imageData.height);

  // Create and append rectangle element
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", imageData.width)
    .attr("height", imageData.height)
    .attr("fill", "white");

  // Whether or not to randomly generate colours
  const generateRandomColours = false;

  // Map that contains a colour mapping: [x, y] => colour
  const colourMap = [];

  // If we want to use randomly generated colours
  if (generateRandomColours) {
    // Generate a random colour for each centroid
    // Assign colour i to centroid i
    Array(colouredCentroids.length)
      .fill()
      .map(() => colourMap.push(generateRandomColour()));
  } else {
    // Assign colour i to centroid i
    Array(colouredCentroids.length)
      .fill()
      .map((_, i) =>
        colourMap.push(
          d3.color(
            `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
          )
        )
      );
  }

  // Loop over all pixels and compute the nearest centroid
  Array(imageData.width)
    .fill()
    .map((_, x) => {
      Array(imageData.height)
        .fill()
        .map((_, y) => {
          // Compute the nearest centroid for each pixel
          // nearestCentroid is a dictionary in the form of {point: [x_coor, y_coor], nearest_centroid: number}
          const nearestCentroid = computeNearestCentroid(
            colouredCentroids,
            x,
            y,
            k
          );

          // Colour the pixels
          svg
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", 1)
            .attr("height", 1)
            .attr("fill", colourMap[nearestCentroid]);
        });

      console.log(x, imageData.width);
    });

  // TODO: This does not work. See what we can do with it since we colour pixels.
  // Render the edges with a certain colour and thickness
  if (displayEdges) {
    svg
      .selectAll("path")
      .style("stroke", selectedEdgeColour)
      .style("stroke-width", selectedEdgeThickness);
  }

  // TODO: This does not work. See what we can do with it since we colour pixels.
  // Render the centroids with a certain size and colour
  if (displayCentroids) {
    colouredCentroids.forEach(centroid => {
      svg
        .append("circle")
        .attr("cx", centroid.x)
        .attr("cy", centroid.y)
        .attr("r", selectedCentroidSize)
        .attr("fill", selectedCentroidColour);
    });
  }
};

const generateRandomColour = () => {
  return "#".concat(
    Math.random()
      .toString(16)
      .substr(-6)
  );
};

export const computeEuclideanDistance = (a, b) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

const computeNearestCentroid = (centroids, x, y, k) => {
  // Compute euclidean distances between centroids and point
  const distances = [];
  centroids.map(centroid =>
    distances.push(computeEuclideanDistance([x, y], [centroid.x, centroid.y]))
  );
  // k for k-nearest centroid
  if (k && k > 1) {
    let i = k > centroids.length ? centroids.length : k;
    // Remove the currently nearest centroid and loop until i = 1
    while (i > 1) {
      distances[distances.indexOf(Math.min.apply(null, distances))] = Infinity;
      i -= 1;
    }
  }
  // For k > 1 we have removed the nearest centroid k - 1 times so we return the k-nearest centroid here
  // Else this just returns the nearest centroid
  return distances.indexOf(Math.min.apply(null, distances));
};
