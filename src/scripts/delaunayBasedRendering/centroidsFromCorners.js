require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colorCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayCorners = (
  originalImageData,
  threshold,
  displayEdges,
  displayCentroids,
  displayColour,
  croppedImageData,
  coordinateMargins
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

  // TODO: Experiment with Sobel
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

  // Add margin to the centroids if we use the cropped image
  if (croppedImageData && coordinateMargins) {
    centroids = centroids.map(centroid => {
      return {
        x: centroid.x + coordinateMargins.width,
        y: centroid.y + coordinateMargins.height,
        color: centroid.color
      };
    });
  }

  // Obtain colours for the centroids
  let coloredCentroids = colorCentroidsByCoordinates(
    originalImageData,
    centroids
  );

  // Set the initial configuration of the svg
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${originalImageData.width} ${originalImageData.height}`
    )
    .attr("width", document.getElementById("resultContainer").offsetWidth)
    .attr("height", document.getElementById("resultContainer").offsetHeight)
    .style("background-color", "black");

  // Compute the delaunay triangulation from the centroids
  const delaunay = d3Delaunay.Delaunay.from(
    coloredCentroids,
    d => d.x,
    d => d.y
  );

  // Compute the Voronoi diagram from the triangulation
  /* eslint no-unused-vars: "off" */
  const voronoi = delaunay.voronoi([
    0,
    0,
    originalImageData.width,
    originalImageData.height
  ]);

  // Construct the result
  // TODO: Handle the cases for @displayEdges and @displayCentroids
  console.log(displayEdges, displayCentroids, displayColour);
  if (displayColour) {
    svg
      .selectAll("path")
      // Construct a data object from each cell of our voronoi diagram
      .data(centroids.map((d, i) => voronoi.renderCell(i)))
      .join("path")
      .attr("d", d => d)
      .style("fill", (d, i) =>
        d3.color(
          `rgb(${centroids[i].color[0]},${centroids[i].color[1]},${centroids[i].color[2]})`
        )
      );
  } else {
    svg
      .selectAll("path")
      // Construct a data object from each cell of our voronoi diagram
      .data(centroids.map((d, i) => voronoi.renderCell(i)))
      .join("path")
      .attr("d", d => d)
      .style("fill", (d, i) => d3.color(`rgb(255, 255, 255)`));
  }

  // Add the edges if they need to be added
  // TODO: Add parameters for colours and opacities in the UI
  if (displayEdges) {
    svg
      .selectAll("path")
      .style("stroke", "black")
      .style("stroke-opacity", 1.0);
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
