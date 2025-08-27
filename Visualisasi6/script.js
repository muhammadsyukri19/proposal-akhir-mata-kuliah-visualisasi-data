const margin = { top: 60, right: 30, bottom: 70, left: 120 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const svg = d3
  .select("#heatmap")
  .append("svg")
  .attr("width", width + margin.left + margin.right + 100)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("../StudentPerformanceFactors.csv").then((data) => {
  const educationLevels = ["High School", "College", "Postgraduate"];
  const incomeLevels = ["Low", "Medium", "High"];

  const matrix = {};
  educationLevels.forEach((e) => {
    matrix[e] = {};
    incomeLevels.forEach((i) => {
      matrix[e][i] = 0;
    });
  });

  data.forEach((d) => {
    const edu = d.Parental_Education_Level;
    const inc = d.Family_Income;
    if (educationLevels.includes(edu) && incomeLevels.includes(inc)) {
      matrix[edu][inc]++;
    }
  });

  const formattedData = [];
  educationLevels.forEach((edu) => {
    incomeLevels.forEach((inc) => {
      formattedData.push({
        education: edu,
        income: inc,
        value: matrix[edu][inc],
      });
    });
  });

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(educationLevels)
    .padding(0.05);

  const y = d3
    .scaleBand()
    .range([height, 0])
    .domain(incomeLevels)
    .padding(0.05);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  // Warna gradasi
  const colorScale = d3
    .scaleThreshold()
    .domain([100, 300, 600, 900, 1200])
    .range(["#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08306b"]);

  // Kotak heatmap
  svg
    .selectAll()
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.education))
    .attr("y", (d) => y(d.income))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", (d) => colorScale(d.value));

  // Angka dalam kotak
  svg
    .selectAll()
    .data(formattedData)
    .enter()
    .append("text")
    .attr("x", (d) => x(d.education) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.income) + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("fill", "black")
    .text((d) => d.value);

  // Label sumbu
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Tingkat Pendidikan Orangtua");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -80)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Pendapatan Keluarga");

  // Legenda
  const legend = svg
    .selectAll(".legend")
    .data(
      colorScale.range().map((color) => {
        const d = colorScale.invertExtent(color);
        return {
          color: color,
          range: d,
        };
      })
    )
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (_, i) => `translate(${width + 30},${i * 25})`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", (d) => d.color);

  legend
    .append("text")
    .attr("x", 25)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text((d) => `${Math.floor(d.range[0])}-${Math.floor(d.range[1])}`);
});
