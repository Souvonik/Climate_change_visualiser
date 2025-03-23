// Plot constants
const MARGIN = { LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 30 };
const WIDTH = 500 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;
const OUTERRADIUS = Math.min(WIDTH, HEIGHT, 500) / 2;
const INNERRADIUS = OUTERRADIUS * 0.1;

let svg,
  g,
  colorScale,
  distScale,
  radialScale,
  title,
  yearText,
  line,
  barWrapper,
  pathWrapper;

let currYear = 1901;

// Updated domain data for ±3°C
const domLow = -3,
  domHigh = 3,
  axisTicks = [-3, -2, -1, 0, 1, 2, 3];

function initChart(canvasElement) {
  // Visualization canvas
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

  g = svg
    .append("g")
    .attr("transform", "translate(" + WIDTH / 2 + "," + (HEIGHT / 2 + 20) + ")");

  // Color scale for anomalies
  colorScale = d3
    .scaleLinear()
    .domain([domLow, 0, domHigh])
    .range(["#1788de", "#ffff8c", "#CE241C"]);

  // Bar height scale
  distScale = d3
    .scaleLinear()
    .range([INNERRADIUS, OUTERRADIUS])
    .domain([domLow, domHigh]);

  // Radial scale for 12 months
  radialScale = d3
    .scaleLinear()
    .range([0, Math.PI * 2])
    .domain([1, 12]);

  // Title
  title = g
    .append("g")
    .attr("class", "title")
    .append("text")
    .attr("dy", HEIGHT / 2)
    .attr("text-anchor", "middle")
    .text("World Temperature Anomaly");

  // Wrapper for bars
  barWrapper = svg
    .append("g")
    .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")");

  pathWrapper = barWrapper.append("g").attr("id", "pathWrapper");

  // Gridlines
  const axes = barWrapper
    .selectAll(".gridCircles")
    .data(axisTicks)
    .enter()
    .append("g");

  axes
    .append("circle")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("opacity", 0.2)
    .attr("class", "axisCircles")
    .attr("r", (d) => distScale(d));

  axes
    .append("text")
    .attr("class", "axisText")
    .attr("y", (d) => distScale(d) - 8)
    .attr("dy", "0.3em")
    .text((d) => d.toFixed(1) + "°C");

  // January reference
  barWrapper
    .append("text")
    .attr("class", "january")
    .attr("x", 7)
    .attr("y", -OUTERRADIUS)
    .attr("dy", "0.9em")
    .text("January");

  barWrapper
    .append("line")
    .attr("class", "yearLine")
    .attr("stroke", "black")
    .attr("opacity", 0.5)
    .attr("x1", 0)
    .attr("y1", -INNERRADIUS * 1.8)
    .attr("x2", 0)
    .attr("y2", -OUTERRADIUS * 1.1);

  // Year in center
  yearText = barWrapper
    .append("text")
    .attr("class", "yearText")
    .attr("text-anchor", "middle")
    .attr("y", 8);

  // Line generator
  line = d3
    .lineRadial()
    .angle((d) => radialScale(d.Month))
    .radius((d) => distScale(d.Anomaly));
}

function updateChart(data, nextYear) {
  const trans = d3.transition().duration(400).ease(d3.easeCubicIn);

  if (nextYear < currYear) {
    const paths = document.getElementById("pathWrapper").children;
    const removeRange = paths.length - (currYear - nextYear);
    const removeElems = [];
    for (let i = removeRange; i < paths.length; i++) {
      removeElems.push(paths[i]);
    }
    removeElems.forEach((elem) => elem.parentNode.removeChild(elem));
  } else if (nextYear > currYear) {
    for (let year = currYear; year < nextYear; year++) {
      const yearData = data.get(String(year));
      const path = pathWrapper
        .append("path")
        .attr("class", "line")
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("d", line(yearData))
        .attr("x", -0.75)
        .style("stroke", colorScale(yearData[0].Anomaly));

      const totalLength = path.node().getTotalLength();

      if ((nextYear - currYear) == 1) {
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition(trans)
          .attr("stroke-dashoffset", 0);
      }
    }
  }

  yearText.text(nextYear);
  currYear = nextYear;
}

export { initChart, updateChart };
