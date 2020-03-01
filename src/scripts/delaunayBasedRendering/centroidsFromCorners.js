require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayCorners = (
  originalImageData,
  threshold,
  displayEdges,
  displayCentroids,
  displayColour,
  croppedImageData,
  coordinateMargins,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  selectedCellColour
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

  svg.on("click", () => {
    // TODO: Using the d3.mouse(d3.event.target) coordinates to obtain the colour does not work and
    // TODO: results in a black cell. This way, we get the colour of some point close to our point...
    const colour = colourCentroidsByCoordinates(originalImageData, [
      { x: d3.event.layerX, y: d3.event.layerY }
    ])[0].colour;

    // Add the new centroid to the list of centroids with a colour
    colouredCentroids.push({
      x: d3.mouse(d3.event.target)[0],
      y: d3.mouse(d3.event.target)[1],
      colour: colour
    });

    // Update the result
    update();
  });

  // Add margin to the centroids if we use the cropped image
  if (croppedImageData && coordinateMargins) {
    centroids = centroids.map(centroid => {
      return {
        x: centroid.x + coordinateMargins.width,
        y: centroid.y + coordinateMargins.height,
        colour: centroid.colour
      };
    });
  }

  // Obtain colours for the centroids
  let colouredCentroids = colourCentroidsByCoordinates(
    originalImageData,
    centroids
  );

  // Redraw the canvas every time the 'update' method is called
  const update = () => {
    // Compute the delaunay triangulation from the centroids
    const delaunay = d3Delaunay.Delaunay.from(
      colouredCentroids,
      d => d.x,
      d => d.y
    );

    // Compute the Voronoi diagram from the triangulation
    const voronoi = delaunay.voronoi([
      0,
      0,
      originalImageData.width,
      originalImageData.height
    ]);

    // Construct the result
    if (!displayColour) {
      svg
        .selectAll("path")
        .data(centroids.map((d, i) => voronoi.renderCell(i)))
        .join("path")
        .attr("d", d => d)
        .style("fill", (d, i) =>
          d3.color(
            `rgb(${centroids[i].colour[0]},${centroids[i].colour[1]},${centroids[i].colour[2]})`
          )
        );
    } else {
      svg
        .selectAll("path")
        .data(centroids.map((d, i) => voronoi.renderCell(i)))
        .join("path")
        .attr("d", d => d)
        .style("fill", selectedCellColour);
    }

    // Render the edges with a certain colour and thickness
    if (displayEdges) {
      svg
        .selectAll("path")
        .style("stroke", selectedEdgeColour)
        .style("stroke-width", selectedEdgeThickness);
    }

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

  update();
};
