require("tracking");
// require("tracking/build/data/face-min");

import * as d3 from "d3";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";
import { pruneCentroidsByMethod } from "../pointCloudLogic";

export const resultFromNaiveEdgesSobel = (
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
  numberOfNeighbours,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance
) => {
  // Set the threshold for the number of corners to detect
  window.fastThreshold = threshold;
  window.tracking.Fast.THRESHOLD = window.fastThreshold;

  const k = numberOfNeighbours;

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
  let centroids = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i].colour > threshold) {
      centroids.push({
        x: edges[i].x,
        y: edges[i].y
      });
    }
  }

  // Apply pruning
  centroids = pruneCentroidsByMethod(
    centroids,
    selectedPruningMethod,
    pruningThreshold,
    pruningDistance
  );

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

  // Redraw the canvas every time the 'update' method is called
  const update = (
    croppedImageData,
    coordinateMargins,
    toBeCroppedImageCoordinates
  ) => {
    // Clear old image
    document.getElementById("voronoiFullResult").innerHTML = "";
    // Set the initial configuration of the svg
    let fullSvg = d3
      .select("#voronoiFullResult")
      .append("svg")
      .attr("width", originalImageData.width)
      .attr("height", originalImageData.height)
      .attr("id", "fullResultSVG")
      .style("background-color", "black");

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

    // Obtain colours for the centroids
    let colouredCentroids = colourCentroidsByCoordinates(
      originalImageData,
      centroids
    );

    const colourMap = [];
    Array(colouredCentroids.length)
      .fill()
      .map((_, i) =>
        colourMap.push(
          d3.color(
            `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
          )
        )
      );

    const nearestCentroids = [];

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

            // Store all the nearest centroid for each pixel for no apparent reason
            nearestCentroids.push({
              point: [x, y],
              nearest_centroid: nearestCentroid
            });

            // Colour the pixels
            fullSvg
              .append("rect")
              .attr("x", x)
              .attr("y", y)
              .attr("width", 1)
              .attr("height", 1)
              .attr("fill", colourMap[nearestCentroid]);
          });

        console.log(x, imageData.width);
      });

    // Render the edges with a certain colour and thickness
    if (displayEdges) {
      fullSvg
        .selectAll("path")
        .style("stroke", selectedEdgeColour)
        .style("stroke-width", selectedEdgeThickness);
    }

    // Render the centroids with a certain size and colour
    if (displayCentroids) {
      colouredCentroids.forEach(centroid => {
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
  };

  update();

  return update;
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
