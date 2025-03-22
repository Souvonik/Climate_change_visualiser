// Plot constants
const MARGIN = { LEFT: 100, RIGHT: 20, TOP: 20, BOTTOM: 100 };
const WIDTH = 700 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

let svg,
  g,
  xLabel,
  yLabel,
  x,
  y,
  xAxisGroup,
  yAxisGroup,
  timeParser,
  dateRange,
  gradient,
  linePath,
  areaPath;

function initChart(canvasElement) {
  svg = d3
    .select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

  g = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

  // Append line and area paths (two separate paths)
  areaPath = g.append("path").attr("class", "area");
  linePath = g.append("path").attr("class", "line");

  // Labels
  xLabel = g
    .append("text")
    .attr("class", "x-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT + 40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle");

  yLabel = g
    .append("text")
    .attr("class", "y-label")
    .attr("x", -HEIGHT / 2)
    .attr("y", -30)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Temperature (℃)");

  // Scales
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  timeParser = d3.timeParse("%b");
  dateRange = monthNames.map((month) => timeParser(month));

  x = d3.scaleTime().range([0, WIDTH]).domain(d3.extent(dateRange));
  y = d3.scaleLinear().range([HEIGHT, 0]).domain([-30, 35]);

  // Gradient
  gradient = g
    .append("linearGradient")
    .attr("id", "temperature-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", y(-30))
    .attr("y2", y(35));

  gradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#1788de" },
      { offset: "50%", color: "#3C81B7" },
      { offset: "70%", color: "#CE241C" },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  // Axes
  xAxisGroup = g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${HEIGHT})`);

  yAxisGroup = g.append("g").attr("class", "y axis");

  const xAxisCall = d3.axisBottom(x)
    .ticks(d3.timeMonth.every(1))
    .tickFormat(d3.timeFormat("%b"));

  xAxisGroup.call(xAxisCall);
}

function updateChart(data) {
  const trans = d3.transition().duration(400);

  xLabel.text(`${data[0].Country}, ${data[0].Year}`);
  data.forEach((d) => {
    d.Temperature = Number(parseFloat(d.Temperature).toFixed(1));
  });

  // Dynamic y-axis domain
  const minTemp = d3.min(data, (d) => Number(d.Temperature));
  const yMin = minTemp < 0 ? -30 : 0; // Stick with -30 or 0
  y.domain([yMin, 35]);

  // Axes update
  const yAxisCall = d3.axisLeft(y);
  yAxisGroup.transition(trans).call(yAxisCall);

  // Update gradient position with new y scale
  gradient.attr("y1", y(-30)).attr("y2", y(35));

  // Line and area generators
  const curve = d3.curveMonotoneX;

  const line = d3.line()
    .curve(curve)
    .x((d) => x(timeParser(d.Statistics.slice(0, 3))))
    .y((d) => y(d.Temperature));

  const area = d3.area()
    .curve(curve)
    .x((d) => x(timeParser(d.Statistics.slice(0, 3))))
    .y0(y(0))
    .y1((d) => y(d.Temperature));

  // Update line path
  linePath
    .datum(data)
    .transition(trans)
    .attr("fill", "none")
    .attr("stroke", "#8d99ae")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  // Update area path
  areaPath
    .datum(data)
    .transition(trans)
    .attr("fill", "url(#temperature-gradient)")
    .attr("opacity", 0.8)
    .attr("d", area);
}

export { initChart, updateChart };
