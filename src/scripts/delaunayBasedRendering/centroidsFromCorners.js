require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colorCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayCorners = (
  imageData,
  threshold,
  displayEdges,
  displayCentroids
) => {
  // Set the threshold for the number of corners to detect
  window.fastThreshold = threshold;
  window.tracking.Fast.THRESHOLD = window.fastThreshold;

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
  let centroids = [{ x: 0, y: 0 }];
  for (let i = 0; i < corners.length; i += 2) {
    centroids.push({
      x: corners[i],
      y: corners[i + 1]
    });
  }

  // Obtain colours for the centroids
  const coloredCentroids = colorCentroidsByCoordinates(imageData, centroids);

  // Set the initial configuration of the svg
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
    .attr("viewBox", `0 0 ${imageData.width} ${imageData.height}`)
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
  const voronoi = delaunay.voronoi([0, 0, imageData.width, imageData.height]);

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
};