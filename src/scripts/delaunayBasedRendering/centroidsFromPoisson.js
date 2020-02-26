import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";

export const resultFromDelaunayPoisson = (
  imageData,
  displayEdges,
  displayCentroids,
  poissonDistance
) => {
  // Compute the centroid based on the greyscaled intensities

  const centroids = [
    ...poissonDiscSampler(
      0,
      0,
      imageData.width,
      imageData.height,
      poissonDistance
    )
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

  // Add the edges if they need to be added
  // TODO: Add parameters for colours and opacities in the UI
  if (displayEdges) {
    svg
      .selectAll("path")
      .style("opacity", 0.6)
      .style("stroke", "white")
      .style("stroke-opacity", 0.2);
  }

  // Add the centroids if they need to be added
  // TODO: Add parameters for sizes and colours in the UI
  if (displayCentroids) {
    centroids.forEach(centroid => {
      svg
        .append("circle")
        .attr("cx", centroid.x)
        .attr("cy", centroid.y)
        .attr("r", 1)
        .attr("fill", "red");
    });
  }
};

function* poissonDiscSampler(x0, y0, x1, y1, radius) {
  const k = 30; // maximum number of samples before rejection
  const width = x1 - x0;
  const height = y1 - y0;
  const radius2 = radius * radius;
  const radius2_3 = 3 * radius2;
  const cellSize = radius * Math.SQRT1_2;
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid = new Array(gridWidth * gridHeight);
  const queue = [];

  // Pick the first sample.
  yield sample(
    width / 2 + Math.random() * radius,
    height / 2 + Math.random() * radius
  );

  // Pick a random existing sample from the queue.
  pick: while (queue.length) {
    const i = (Math.random() * queue.length) | 0;
    const parent = queue[i];

    // Make a new candidate between [radius, 2 * radius] from the existing sample.
    for (let j = 0; j < k; ++j) {
      const a = 2 * Math.PI * Math.random();
      const r = Math.sqrt(Math.random() * radius2_3 + radius2);
      const x = parent[0] + r * Math.cos(a);
      const y = parent[1] + r * Math.sin(a);

      // Accept candidates that are inside the allowed extent
      // and farther than 2 * radius to all existing samples.
      if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) {
        yield sample(x, y);
        continue pick;
      }
    }

    // If none of k candidates were accepted, remove it from the queue.
    const r = queue.pop();
    if (i < queue.length) queue[i] = r;
  }

  function far(x, y) {
    const i = (x / cellSize) | 0;
    const j = (y / cellSize) | 0;
    const i0 = Math.max(i - 2, 0);
    const j0 = Math.max(j - 2, 0);
    const i1 = Math.min(i + 3, gridWidth);
    const j1 = Math.min(j + 3, gridHeight);
    for (let j = j0; j < j1; ++j) {
      const o = j * gridWidth;
      for (let i = i0; i < i1; ++i) {
        const s = grid[o + i];
        if (s) {
          const dx = s[0] - x;
          const dy = s[1] - y;
          if (dx * dx + dy * dy < radius2) return false;
        }
      }
    }
    return true;
  }

  function sample(x, y) {
    queue.push(
      (grid[gridWidth * ((y / cellSize) | 0) + ((x / cellSize) | 0)] = [x, y])
    );
    // Round the values, otherwise we do not have pixel coordinates.
    return {
      x: Math.round(x + x0),
      y: Math.round(y + y0),
      color: [255, 255, 255]
    };
  }
}
