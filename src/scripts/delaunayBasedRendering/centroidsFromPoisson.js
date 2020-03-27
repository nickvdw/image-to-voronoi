import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

import { colourCentroidsByCoordinates } from "@/scripts/imageHandler";
import { pruneCentroidsByMethod } from "../pointCloudLogic";

export const resultFromDelaunayPoisson = (
  originalImageData,
  displayEdges,
  displayCentroids,
  displayColour,
  croppedImageData,
  coordinateMargins,
  poissonDistance,
  selectedEdgeThickness,
  selectedEdgeColour,
  selectedCentroidSize,
  selectedCentroidColour,
  selectedCellColour,
  toBeCroppedImageCoordinates,
  customColour,
  selectedPruningMethod,
  pruningThreshold,
  pruningDistance,
  pruningClusterCount
) => {
  let imageData = originalImageData;
  if (croppedImageData && coordinateMargins) {
    imageData = croppedImageData;
  }

  // Compute centroids basied on poisson disc sampling with a certain radius (distance)
  let centroids = [
    ...poissonDiscSampler(
      0,
      0,
      imageData.width,
      imageData.height,
      poissonDistance
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

export function* poissonDiscSampler(x0, y0, x1, y1, radius) {
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
      if (0 <= x && x < width - 10 && 0 <= y && y < height - 10 && far(x, y)) {
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
