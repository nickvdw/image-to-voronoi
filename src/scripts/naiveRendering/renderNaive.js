import * as d3 from "d3";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";
import { generateRandomColour, computeNearestCentroid } from "../knnLogic";

export const renderNaive = (
  imageData,
  originalImageData,
  numberOfNeighbours,
  displayEdges,
  displayCentroids,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  generateRandomColours,
  colourMap,
  centroids
) => {
  return (croppedImageData, coordinateMargins, toBeCroppedImageCoordinates) => {
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

    // Create and append rectangle element
    fullSvg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", imageData.width)
      .attr("height", imageData.height)
      .attr("fill", "white");

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
    const colouredCentroids = colourCentroidsByCoordinates(
      imageData,
      centroids
    );

    // If we want to use randomly generated colours
    if (generateRandomColours) {
      // Generate a random colour for each centroid
      // Assign colour i to centroid i
      Array(colouredCentroids.length)
        .fill()
        .map(() => colourMap.push(generateRandomColour()));
    } else {
      // Assign colour i to centroid i
      Array(colouredCentroids.length)
        .fill()
        .map((_, i) =>
          colourMap.push(
            d3.color(
              `rgb(${colouredCentroids[i].colour[0]},${colouredCentroids[i].colour[1]},${colouredCentroids[i].colour[2]})`
            )
          )
        );
    }

    // Loop over all pixels and compute the nearest centroid
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
              numberOfNeighbours
            );

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
      // .attr(
      //   "viewBox",
      //   `0 0 ${originalImageData.width} ${originalImageData.height}`
      // )
      // .attr("width", document.getElementById("resultContainer").offsetWidth)
      // .attr("height", document.getElementById("resultContainer").offsetHeight);
      .attr("width", originalImageData.width)
      .attr("height", originalImageData.height);

    svg.on("click", () => {
      // Add the new centroid to the list of centroids
      // x, y needs to be floored for the getColour method
      centroids.push({
        x: Math.floor(d3.mouse(d3.event.target)[0]),
        y: Math.floor(d3.mouse(d3.event.target)[1])
      });
    });
  };
};
