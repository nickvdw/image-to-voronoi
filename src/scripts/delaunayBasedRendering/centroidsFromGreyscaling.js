import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import {
  greyScaleImage,
  computeCentroidsFromGreyScale,
  colorCentroidsByCoordinates
} from "@/scripts/imageHandler";

export const resultFromDelaunayGreyscaling = (
  imageData,
  // threshold,
  displayEdges,
  displayCentroids
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
    ...computeCentroidsFromGreyScale(greyScaleImageData, 0.8, false, 20, 10),
    ...computeCentroidsFromGreyScale(greyScaleImageData, 0.5, true, 20, 10)
  ];

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
