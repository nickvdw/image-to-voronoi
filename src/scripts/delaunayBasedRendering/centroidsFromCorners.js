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
  toBeCroppedImageCoordinates
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

  let fullSvg;

  // Set the initial configuration of the svg
  fullSvg = d3
    .select("#voronoiFullResult")
    .append("svg")
    .attr("width", originalImageData.width)
    .attr("height", originalImageData.height)
    .attr("id", "fullResultSVG")
    .style("background-color", "black");
  // TODO: Add something for dragging centroids

  // TODO: Add a "selector" tool that can be used to select a rectangle and remove all centroids in that rectangle

  // Store the centroids based on the corners
  let centroids = [];
  for (let i = 0; i < corners.length; i += 2) {
    centroids.push({
      x: corners[i],
      y: corners[i + 1]
    });
  }

  // TODO: Selected pixels dont correspond with real pixels because of the resizing
  // TODO: Cannot use a cropper and SVG element. Cropper needs to be with image.

  if (toBeCroppedImageCoordinates) {
    const xStart = toBeCroppedImageCoordinates.start.x;
    const xEnd = toBeCroppedImageCoordinates.end.x;
    const yStart = toBeCroppedImageCoordinates.start.y;
    const yEnd = toBeCroppedImageCoordinates.end.y;

    let removedCentroids = [];
    // This one doesn't give the correct sizes
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
      fullSvg
        .selectAll("path")
        // Construct a data object from each cell of our voronoi diagram
        .data(colouredCentroids.map((d, i) => voronoi.renderCell(i)))
        .join("path")
        .attr("d", d => d)
        .style("fill", (d, i) => {
          // console.log(colouredCentroids[i]);
          return d3.color(
            `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
          );
        });
    } else {
      fullSvg
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
      fullSvg
        .selectAll("path")
        .style("stroke", "black")
        .style("stroke-opacity", 1.0);
    }

    // Add the centroids if they need to be added
    // TODO: Add parameters for sizes and colours in the UI
    if (displayCentroids) {
      colouredCentroids.forEach(centroid => {
        fullSvg
          .append("circle")
          .attr("cx", centroid.x)
          .attr("cy", centroid.y)
          .attr("r", 1)
          .attr("fill", "red");
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

      // Add the new centroid to the list of centroids
      // x, y needs to be floored for the getColour method
      centroids.push({
        x: Math.floor(d3.mouse(d3.event.target)[0]),
        y: Math.floor(d3.mouse(d3.event.target)[1])
      });

      // Update the result
      update();
    });
  };

  update();
};
