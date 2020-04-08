import * as d3 from "d3";
// import { Delaunay } from "d3-delaunay";

// Returns the hex code of a colour that belongs to the nearest centroid
// in nearestCentroid from colourMap
// const getColourFromCentroid = (colourMap, nearestCentroid) => {
//   return colourMap[nearestCentroid.nearest_centroid].colour;
// };

export const generateRandomColour = () => {
  return "#".concat(
    Math.random()
      .toString(16)
      .substr(-6)
  );
};

export const computeEuclideanDistance = (a, b) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

export const computeNearestCentroid = (centroids, x, y, k) => {
  // Compute euclidean distances between centroids and point
  const distances = [];
  centroids.map((centroid, index) =>
    distances.push({
      distance: computeEuclideanDistance([x, y], [centroid.x, centroid.y]),
      index
    })
  );

  distances.sort((a, b) => a.distance - b.distance);
  // k for k-nearest centroid
  if (k > 0) {
    return distances[k - 1].index;
  }
  return distances[0].index;
};

export const renderVoronoi = (centroids, width, height, k) => {
  // Create SVG element
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create and append rectangle element
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white"); // lol

  // The centroids used for the Voronoi diagram generation
  // const testCentroids = [
  //   [300, 75],
  //   [25, 25],
  //   [50, 50],
  //   [200, 100],
  //   [100, 150]
  // ];

  // Whether or not to randomly generate colours
  const generateRandomColours = false;

  // Map that contains a colour mapping: [x, y] => colour
  const colourMap = [];

  // If we want to use randomly generated colours
  if (generateRandomColours) {
    // Generate a random colour for each centroid
    // Assign colour i to centroid i
    Array(centroids.length)
      .fill()
      .map(() => colourMap.push(generateRandomColour()));
  } else {
    // Assign colour i to centroid i
    Array(centroids.length)
      .fill()
      .map((_, i) =>
        colourMap.push(
          d3.color(
            `rgb(${centroids[i].colour[0]},${centroids[i].colour[1]},${centroids[i].colour[2]})`
          )
        )
      );
  }

  // Array that stores dictionarities in the form of {point: [x_coor, y_coor], nearest_centroid: number}
  const nearestCentroids = [];

  // Loop over all pixels and compute the nearest centroid
  Array(width)
    .fill()
    .map((_, x) => {
      Array(height)
        .fill()
        .map((_, y) => {
          // Compute the nearest centroid for each pixel
          // nearestCentroid is a dictionary in the form of {point: [x_coor, y_coor], nearest_centroid: number}
          const nearestCentroid = computeNearestCentroid(centroids, x, y, k);

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
    });
};

export default renderVoronoi;
