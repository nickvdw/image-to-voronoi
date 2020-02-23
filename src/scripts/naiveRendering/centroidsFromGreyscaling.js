import * as d3 from "d3";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";

export const resultFromNaiveGreyscaling = (
  imageData,
  // threshold,
  displayEdges,
  displayCentroids
) => {
  // I am still not sure why, but this is needed for the colours
  const imageDataCopy = {
    ...imageData,
    data: [...imageData.data]
  };

  const k = 1;

  // Greyscale the image
  const greyScaleImageData = greyScaleImage(imageDataCopy);

  // Compute the centroid based on the greyscaled intensities
  // TODO: Create parameters in the UI for these options
  const centroids = [
    ...computeCentroidsFromGreyScale(greyScaleImageData, 0.8, false, 20, 10),
    ...computeCentroidsFromGreyScale(greyScaleImageData, 0.5, true, 20, 10)
  ];

  // Obtain colours for the centroids
  const coloredCentroids = colorCentroidsByCoordinates(imageData, centroids);

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
    Array(coloredCentroids.length)
      .fill()
      .map(() => colourMap.push(generateRandomColour()));
  } else {
    // Assign colour i to centroid i
    Array(coloredCentroids.length)
      .fill()
      .map((_, i) =>
        colourMap.push(
          d3.color(
            `rgb(${coloredCentroids[i].color[0]},${coloredCentroids[i].color[1]},${coloredCentroids[i].color[2]})`
          )
        )
      );
  }

  // Array that stores dictionarities in the form of {point: [x_coor, y_coor], nearest_centroid: number}
  const nearestCentroids = [];

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
            coloredCentroids,
            x,
            y,
            k
          );

          // Store all the nearest centroid for each pixel for no apparent reason
          nearestCentroids.push({
            point: [x, y],
            nearest_centroid: nearestCentroid
          });

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

  // Add the edges if they need to be added
  // TODO: Add parameters for colours and opacities in the UI
  if (displayEdges) {
    svg
      .selectAll("path")
      .style("opacity", 0.6)
      .style("stroke", "white")
      .style("stroke-opacity", 0.2);
  }

  // Add the centroids if they need to be added
  // TODO: Add parameters for sizes and colours in the UI
  if (displayCentroids) {
    centroids.forEach(centroid => {
      svg
        .append("circle")
        .attr("cx", centroid.x)
        .attr("cy", centroid.y)
        .attr("r", 1)
        .attr("fill", "red");
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
      distances.splice(distances.indexOf(Math.min.apply(null, distances)), 1);
      i -= 1;
    }
  }
  // For k > 1 we have removed the nearest centroid k - 1 times so we return the k-nearest centroid here
  // Else this just returns the nearest centroid
  return distances.indexOf(Math.min.apply(null, distances));
};
