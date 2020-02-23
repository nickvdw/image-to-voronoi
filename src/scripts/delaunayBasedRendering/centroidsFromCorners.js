require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colorCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayCorners = (
<<<<<<< HEAD
  imageData,
  threshold,
  displayEdges,
  displayCentroids
=======
  originalImageData,
  threshold,
  displayEdges,
  displayCentroids,
  croppedImageData,
  coordinateMargins
>>>>>>> master
) => {
  // Set the threshold for the number of corners to detect
  window.fastThreshold = threshold;
  window.tracking.Fast.THRESHOLD = window.fastThreshold;

<<<<<<< HEAD
=======
  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

>>>>>>> master
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
<<<<<<< HEAD
  let centroids = [{ x: 0, y: 0 }];
=======
  let centroids = [];
>>>>>>> master
  for (let i = 0; i < corners.length; i += 2) {
    centroids.push({
      x: corners[i],
      y: corners[i + 1]
    });
  }

<<<<<<< HEAD
  // Obtain colours for the centroids
  const coloredCentroids = colorCentroidsByCoordinates(imageData, centroids);
=======
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
>>>>>>> master

  // Set the initial configuration of the svg
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
<<<<<<< HEAD
    .attr("viewBox", `0 0 ${imageData.width} ${imageData.height}`)
=======
    .attr(
      "viewBox",
      `0 0 ${originalImageData.width} ${originalImageData.height}`
    )
>>>>>>> master
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
<<<<<<< HEAD
  const voronoi = delaunay.voronoi([0, 0, imageData.width, imageData.height]);
=======
  const voronoi = delaunay.voronoi([
    0,
    0,
    originalImageData.width,
    originalImageData.height
  ]);
>>>>>>> master

  // Construct the result
  // TODO: Handle the cases for @displayEdges and @displayCentroids
  console.log(displayEdges, displayCentroids);
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
