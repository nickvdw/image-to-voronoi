import * as d3 from "d3";
import * as d3Delaunay from "d3-delaunay";

// Render a Voronoi diagram based on some random points
export const renderVoronoiUsingD3 = (centroids, width, height, k) => {
  console.log(k);
  const canvas = document.getElementById("voronoiResult");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const path = d3
    .geoPath()
    .context(context)
    .pointRadius(3);

  const m = 1;
  const delaunay = d3Delaunay.Delaunay.from(
    centroids,
    d => d.x,
    d => d.y
  );
  const voronoi = delaunay.voronoi([m, m, width - m, height - m]);

  function render() {
    context.clearRect(0, 0, width, height);

    context.strokeStyle = "#000";

    // Can use context.fillStyle and context.fill() here
    context.beginPath();
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.stroke();

    context.fillStyle = "black";
    context.beginPath();
    path({ type: "MultiPoint", coordinates: centroids });
    context.fill();
  }

  render();

  function renderColours() {
    const svg = d3
      .select("#voronoiResult")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("stroke-width", 2);

    let voronoi = d3Delaunay.Delaunay.from(
      centroids,
      d => d.x,
      d => d.y
    ).voronoi([0, 0, width, height]);

    const circle = svg
      .append("g")
      .selectAll("circle")
      .data(centroids)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    const mesh = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("d", voronoi.render());

    const cell = svg
      .append("g")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .selectAll("path")
      .data(centroids)
      .join("path")
      .attr("d", (d, i) => voronoi.renderCell(i))
      .style("fill", d3.color("steelblue"))
      .call(
        d3
          .drag()
          .on("start", d =>
            circle
              .filter(p => p === d)
              .raise()
              .attr("stroke", "black")
          )
          .on("drag", d => ((d.x = d3.event.x), (d.y = d3.event.y)))
          .on("end", d => circle.filter(p => p === d).attr("stroke", null))
          .on("start.update drag.update end.update", update)
      );

    function update() {
      voronoi = d3Delaunay.Delaunay.from(centroids).voronoi([
        0,
        0,
        width,
        height
      ]);
      circle.attr("cx", d => d.x).attr("cy", d => d.y);
      cell.attr("d", (d, i) => voronoi.renderCell(i));
      mesh.attr("d", voronoi.render());
    }

    return svg.node();
  }

  renderColours();
  // const svg = renderColours();

  return (
    d3
      .select(context.canvas)
      // .on('mousemove', () => {
      //   const m = d3.mouse(this);
      //   const i = delaunay.find(...m);
      //   render(i);
      // })
      .node()
  );
};

export const renderColoredVoronoi = (centroids, width, height, k) => {
  const svg = d3
    .select("#voronoiResult")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#1a1a1a");
  console.log(k);
  // Generate the delaunay triangulation of our data
  // takes data, x accessor and y accessor as arguments
  const delaunay = d3Delaunay.Delaunay.from(
    centroids,
    d => d.x,
    d => d.y
  );
  // Generate teh voronoi diagram from our delaunay triangulation
  // Takes the bounds of our diagram area as arguments [x0,y0,x1,y1]
  const voronoi = delaunay.voronoi([0, 0, width, height]);

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
    // .style("opacity", 0.8)
    // .style("stroke", "white")
    // .style("stroke-opacity", 0.2);

  // append all of our points so that we can see how they line up with the voronoi
  // svg
  //   .selectAll("circle")
  //   .data(centroids)
  //   .join("circle")
  //   .attr("cx", d => d.x)
  //   .attr("cy", d => d.y)
  //   .attr("r", 1.5)
  //   .style("fill", "white");

  return svg.node();
};

export default renderVoronoiUsingD3;
