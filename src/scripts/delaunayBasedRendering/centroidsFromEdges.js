require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayEdges = (
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

  // Grayscaling reduced the size of the pixel array to 1/4th, we need to reconstruct it
  let grayImageData = [];
  for (let i = 0; i < gray.length; i++) {
    grayImageData.push(gray[i], gray[i], gray[i], 255);
  }

  // Run Sobel edge detection on the image
  const edgePixels = window.tracking.Image.sobel(
    grayImageData,
    imageData.width,
    imageData.height
  );

  // Normalise all the values, as some values are over 255
  let max = 0;
  for (let i = 0; i < edgePixels.length; i += 4) {
    if (edgePixels[i] > max) {
      max = edgePixels[i];
    }
  }

  // Set x to be our iterative and normalise all values
  let x = 0;
  while (x < edgePixels.length) {
    edgePixels[x] = 255 * (edgePixels[x] / max);
    x += 4;
  }

  // Reset x and link each value to a coordinate under the array 'edges'
  let edges = [];
  x = 0;
  for (let i = 0; i < imageData.height; i++) {
    for (let j = 0; j < imageData.width; j++) {
      edges.push({
        x: j,
        y: i,
        colour: Math.round(edgePixels[x])
      });
      x += 4;
    }
  }

  // Centroids are now being made under a certain threshold condition (value over ...)
  // TODO: replace dummy threshold variable with the one from the method parameter
  const dummyTreshold = 40;
  let centroids = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].colour > dummyTreshold) {
      centroids.push({
        x: edges[i].x,
        y: edges[i].y
      });
    }
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

  // TODO: Add something for dragging centroids

  // TODO: Add a "selector" tool that can be used to select a rectangle and remove all centroinds in that rectangle

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

  // // Store the centroids based on the corners
  // let centroids = [];
  // for (let i = 0; i < corners.length; i += 2) {
  //   centroids.push({
  //     x: corners[i],
  //     y: corners[i + 1]
  //   });
  // }

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
    if (displayColour) {
      svg
        .selectAll("path")
        // Construct a data object from each cell of our voronoi diagram
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
        // Construct a data object from each cell of our voronoi diagram
        .data(centroids.map((d, i) => voronoi.renderCell(i)))
        .join("path")
        .attr("d", d => d)
        .style("fill", d3.color(`rgb(255, 255, 255)`));
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
      colouredCentroids.forEach(centroid => {
        svg
          .append("circle")
          .attr("cx", centroid.x)
          .attr("cy", centroid.y)
          .attr("r", 1)
          .attr("fill", "red");
      });
    }
  };

  // svg.on("click", () => {
  //   console.log(d3.mouse("svg"));
  //   console.log(d3.event);
  //   colouredCentroids.push(
  //     colourCentroidsByCoordinates(imageData, [
  //       { x: d3.event.layerX, y: d3.event.layerY }
  //     ])[0]
  //   );
  //   update();
  // });

  update();
};
