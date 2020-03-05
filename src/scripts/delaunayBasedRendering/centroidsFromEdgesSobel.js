require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayEdgesSobel = (
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
  selectedCellColour,
  toBeCroppedImageCoordinates,
  customColour
) => {
  // Set the threshold for the number of edges to detect
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

  // Set the initial configuration of the svg
  let fullSvg = d3
    .select("#voronoiFullResult")
    .append("svg")
    .attr("width", originalImageData.width)
    .attr("height", originalImageData.height)
    .attr("id", "fullResultSVG")
    .style("background-color", "black");

  // Centroids are now being made under a certain threshold condition (value over ...)
  let centroids = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].colour > threshold) {
      centroids.push({
        x: edges[i].x,
        y: edges[i].y
      });
    }
  }

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
  const update = (
    croppedImageData,
    coordinateMargins,
    toBeCroppedImageCoordinates
  ) => {
    if (croppedImageData && coordinateMargins) {
      imageData = croppedImageData;
    }

    if (toBeCroppedImageCoordinates) {
      const xStart = toBeCroppedImageCoordinates.start.x;
      const xEnd = toBeCroppedImageCoordinates.end.x;
      const yStart = toBeCroppedImageCoordinates.start.y;
      const yEnd = toBeCroppedImageCoordinates.end.y;

      let removedCentroids = [];
      for (let i = centroids.length - 1; i >= 0; i--) {
        if (
          centroids[i].x >= xStart &&
          centroids[i].x <= xEnd &&
          centroids[i].y >= yStart &&
          centroids[i].y <= yEnd
        ) {
          removedCentroids.push(centroids[i]);
          centroids.splice(i, 1);
        }
      }
    }

    // Recolour centroids
    colouredCentroids = colourCentroidsByCoordinates(
      originalImageData,
      centroids
    );

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
      if (!customColour) {
        fullSvg
          .selectAll("path")
          // Construct a data object from each cell of our voronoi diagram
          .data(colouredCentroids.map((d, i) => voronoi.renderCell(i)))
          .join("path")
          .attr("d", d => d)
          .style("stroke", (d, i) => {
            return d3.color(
              `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
            );
          })
          .style("fill", (d, i) => {
            return d3.color(
              `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
            );
          });
      } else {
        fullSvg
          .selectAll("path")
          .data(centroids.map((d, i) => voronoi.renderCell(i)))
          .join("path")
          .attr("d", d => d)
          .style("fill", selectedCellColour);
      }
    }

    // Render the edges with a certain colour and thickness
    if (displayEdges && !displayColour) {
      fullSvg
        .selectAll("path")
        .data(centroids.map((d, i) => voronoi.renderCell(i)))
        .join("path")
        .attr("d", d => d)
        .style("fill", selectedCellColour);
      fullSvg
        .selectAll("path")
        .style("stroke", selectedEdgeColour)
        .style("stroke-width", selectedEdgeThickness);
    } else if (displayEdges) {
      fullSvg
        .selectAll("path")
        .style("stroke", selectedEdgeColour)
        .style("stroke-width", selectedEdgeThickness);
    }

    // Render the centroids with a certain size and colour
    if (displayCentroids) {
      centroids.forEach(centroid => {
        fullSvg
          .append("circle")
          .attr("cx", centroid.x)
          .attr("cy", centroid.y)
          .attr("r", selectedCentroidSize)
          .attr("fill", selectedCentroidColour);
      });
    }

    // Clone the image to the viewbox voronoiResult
    const clone = fullSvg.node().cloneNode(true);

    // Clear old image
    document.getElementById("voronoiResult").innerHTML = "";

    const svg = d3
      .select("#voronoiResult")
      .append("svg")
      .html(clone.outerHTML)
      .attr(
        "viewBox",
        `0 0 ${originalImageData.width} ${originalImageData.height}`
      )
      .attr("width", document.getElementById("resultContainer").offsetWidth)
      .attr("height", document.getElementById("resultContainer").offsetHeight);

    svg.on("click", () => {
      // Add the new centroid to the list of centroids
      // x, y needs to be floored for the getColour method
      centroids.push({
        x: Math.floor(d3.mouse(d3.event.target)[0]),
        y: Math.floor(d3.mouse(d3.event.target)[1])
      });

      // Update the result with the new centroid
      update();
    });
  };

  update(croppedImageData, coordinateMargins, toBeCroppedImageCoordinates);
  return update;
};
