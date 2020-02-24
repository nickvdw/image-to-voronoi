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

  let svg;

  // Set the initial configuration of the svg
  svg = d3
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
    const img = document.getElementsByClassName(
      "vue-advanced-cropper__image"
    )[0];
    const factorW = originalImageData.width / img.offsetWidth;
    // const factorH = originalImageData.height / img.offsetHeight;

    const xStart = toBeCroppedImageCoordinates.start.x * factorW;
    const xEnd = toBeCroppedImageCoordinates.end.x * factorW;
    const yStart = toBeCroppedImageCoordinates.start.y;
    const yEnd = toBeCroppedImageCoordinates.end.y * factorW;

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

    debugger;
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
