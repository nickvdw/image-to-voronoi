import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colourCentroidsByCoordinates
} from "@/scripts/imageHandler";

export const resultFromDelaunayGreyscaling = (
  imageData,
  displayEdges,
  displayCentroids,
  displayColour,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  selectedCellColour,
  selectedGreyscaleThreshold,
  selectedGreyscaleX,
  selectedGreyscaleY
) => {
  // I am still not sure why, but this is needed for the colours
  const imageDataCopy = {
    ...imageData,
    data: [...imageData.data]
  };

  // Greyscale the image
  const greyScaleImageData = greyScaleImage(imageDataCopy);

  // Compute the centroid based on the greyscaled intensities
  // TODO: Create parameters in the UI for these options
  const centroids = [
    ...computeCentroidsFromGreyScale(
      greyScaleImageData,
      selectedGreyscaleThreshold,
      false,
      selectedGreyscaleX,
      selectedGreyscaleY
    )
    // ...computeCentroidsFromGreyScale(greyScaleImageData, 0.5, true, 20, 10)
  ];

  // Obtain colours for the centroids
  const colouredCentroids = colourCentroidsByCoordinates(imageData, centroids);

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
    colouredCentroids,
    d => d.x,
    d => d.y
  );

  // Compute the Voronoi diagram from the triangulation
  const voronoi = delaunay.voronoi([0, 0, imageData.width, imageData.height]);

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
