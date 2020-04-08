import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colourCentroidsByCoordinates
} from "@/scripts/imageHandler";
import { pruneCentroidsByMethod } from "../pointCloudLogic";

export const resultFromDelaunayGreyscaling = (
  originalImageData,
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
  selectedGreyscaleThreshold,
  selectedGreyscaleX,
  selectedGreyscaleY,
  toBeCroppedImageCoordinates,
  customColour,
  inverseThreshold,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  pruningClusterCount
) => {
  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

  // This copy is needed as the greyscaleImage method edits the data
  const imageDataCopy = {
    width: imageData.width,
    height: imageData.height,
    data: [...imageData.data]
  };

  // Greyscale the image
  const greyScaleImageData = greyScaleImage(imageDataCopy);

  // Compute the centroid based on the greyscaled intensities
  let centroids = [
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      inverseThreshold,
      selectedGreyscaleX,
      selectedGreyscaleY
    )
  ];

  // Apply pruning
  centroids = pruneCentroidsByMethod(
    centroids,
    selectedPruningMethod,
    pruningThreshold,
    pruningDistance,
    pruningClusterCount
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

    // Recolour centroids
    const colouredCentroids = colourCentroidsByCoordinates(
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
