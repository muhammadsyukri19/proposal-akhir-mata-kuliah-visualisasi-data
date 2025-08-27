// Ukuran dan margin untuk visualisasi
const width = 700;
const height = 500;
const margin = { top: 60, right: 60, bottom: 100, left: 120 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Membuat tooltip
const tooltip = d3.select("body").append("div").attr("class", "tooltip");

// Membuat SVG container
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Area untuk chart
const chart = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data
d3.csv("../StudentPerformanceFactors.csv").then((data) => {
  data.forEach((d) => {
    d.Hours_Studied = +d.Hours_Studied;
    d.Attendance = +d.Attendance;

    // Kategori jam belajar
    if (d.Hours_Studied < 7) d.StudyCat = "Sangat Rendah";
    else if (d.Hours_Studied < 14) d.StudyCat = "Rendah";
    else if (d.Hours_Studied < 21) d.StudyCat = "Sedang";
    else if (d.Hours_Studied <= 35) d.StudyCat = "Tinggi";
    else d.StudyCat = "Sangat Tinggi";

    // Kategori kehadiran
    if (d.Attendance < 70) d.AttendCat = "Rendah";
    else if (d.Attendance <= 85) d.AttendCat = "Sedang";
    else d.AttendCat = "Tinggi";
  });

  // Urutan kategori
  const studyCategories = [
    "Sangat Rendah",
    "Rendah",
    "Sedang",
    "Tinggi",
    "Sangat Tinggi",
  ];

  const attendCategories = ["Tinggi", "Sedang", "Rendah"];

  // Hitung distribusi proporsi
  const counts = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.StudyCat,
    (d) => d.AttendCat
  );

  const totals = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.StudyCat
  );

  const heatData = [];
  studyCategories.forEach((study) => {
    attendCategories.forEach((attend) => {
      const total = totals.get(study) || 1;
      const count = counts.get(study)?.get(attend) || 0;
      const value = count / total;
      heatData.push({
        StudyCat: study,
        AttendCat: attend,
        Value: value,
        Count: count,
        Total: total,
      });
    });
  });

  // Scales
  const x = d3
    .scaleBand()
    .domain(studyCategories)
    .range([0, innerWidth])
    .padding(0.1);

  const y = d3
    .scaleBand()
    .domain(attendCategories)
    .range([0, innerHeight])
    .padding(0.1);

  // Skema warna yang lebih soft - dari terang ke gelap (tapi tidak terlalu gelap)
  const color = d3
    .scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([0, 0.9]);

  // Axis
  chart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-size", "11px")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-25)");

  chart
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "11px");

  // Judul axis
  chart
    .append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom - 30)
    .attr("text-anchor", "middle")
    .text("Kategori Jam Belajar");

  chart
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 30)
    .attr("text-anchor", "middle")
    .text("Tingkat Kehadiran");

  // Cells
  chart
    .selectAll("rect")
    .data(heatData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => x(d.StudyCat))
    .attr("y", (d) => y(d.AttendCat))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) => color(d.Value))
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "#2c3e50")
        .style("stroke-width", 2);

      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(
          `
        <strong>Kategori Jam Belajar:</strong> ${d.StudyCat}<br>
        <strong>Tingkat Kehadiran:</strong> ${d.AttendCat}<br>
        <strong>Persentase:</strong> ${(d.Value * 100).toFixed(1)}%<br>
        <strong>Jumlah:</strong> ${d.Count} dari ${d.Total} siswa
      `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(500).style("stroke-width", 0);

      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Text labels
  chart
    .selectAll("text.value")
    .data(heatData)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", (d) => x(d.StudyCat) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.AttendCat) + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("fill", (d) => (d.Value > 0.65 ? "white" : "black"))
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .text((d) => `${Math.round(d.Value * 100)}%`);

  // Membuat color legend
  const legendWidth = innerWidth * 0.8;
  const legendHeight = 20;

  const legendScale = d3.scaleLinear().domain([0, 1]).range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues([0, 0.25, 0.5, 0.75, 1])
    .tickFormat((d) => d * 100 + "%");

  const defs = svg.append("defs");

  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: color(0) },
      { offset: "25%", color: color(0.225) },
      { offset: "50%", color: color(0.45) },
      { offset: "75%", color: color(0.675) },
      { offset: "100%", color: color(0.9) },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${margin.left + (innerWidth - legendWidth) / 2}, ${
        height - 40
      })`
    );

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient)");

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

  // Judul
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Distribusi Siswa berdasarkan Jam Belajar dan Kehadiran");
});
