import * as d3 from "d3";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colourCentroidsByCoordinates
} from "@/scripts/imageHandler";
import {
  generatePartitions,
  computeNearestCentroidFromPartitions
} from "../partitioning";

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
  selectedGreyscaleY
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
  const centroids = [
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      false,
      selectedGreyscaleX,
      selectedGreyscaleY
    ),
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      true,
      selectedGreyscaleX,
      selectedGreyscaleY
    )
  ];

  // Obtain colours for the centroids
  const colouredCentroids = colourCentroidsByCoordinates(imageData, centroids);
  const partitions = generatePartitions(
    colouredCentroids,
    imageData.width,
    imageData.height,
    3
  );
  console.log(colouredCentroids);
  console.log(partitions);

  console.log(centroids.length, imageData.width, imageData.height);
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
  console.warn("No centroids were generated (Length of 0)");
  centroids.length > 0 &&
    Array(imageData.width)
      .fill()
      .map((_, x) => {
        Array(imageData.height)
          .fill()
          .map((_, y) => {
            const nearestCentroid = computeNearestCentroidFromPartitions(
              x,
              y,
              k,
              imageData.width,
              imageData.height,
              partitions
            );
            console.log(nearestCentroid);
            // Colour the pixels
            if (nearestCentroid != -1) {
              svg
                .append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 1)
                .attr("height", 1)
                .attr("fill", colourMap[nearestCentroid]);
            }
          });
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

// export const computeEuclideanDistance = (a, b) => {
//   return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
// };

// const computeNearestCentroid = (centroids, x, y, k) => {
//   // Compute euclidean distances between centroids and point
//   const distances = [];
//   centroids.map(centroid =>
//     distances.push(computeEuclideanDistance([x, y], [centroid.x, centroid.y]))
//   );
//   // k for k-nearest centroid
//   if (k && k > 1) {
//     let i = k > centroids.length ? centroids.length : k;
//     // Remove the currently nearest centroid and loop until i = 1
//     while (i > 1) {
//       distances.splice(distances.indexOf(Math.min.apply(null, distances)), 1);
//       i -= 1;
//     }
//   }
//   // For k > 1 we have removed the nearest centroid k - 1 times so we return the k-nearest centroid here
//   // Else this just returns the nearest centroid
//   return distances.indexOf(Math.min.apply(null, distances));
// };
