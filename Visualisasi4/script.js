d3.csv("../StudentPerformanceFactors.csv").then(function (data) {
  console.log("Loaded Data:", data); // Debugging untuk memastikan data terbaca dengan benar

  // Mengelompokkan rata-rata nilai ujian berdasarkan kategori Motivation_Level
  const groupedData = d3.rollup(
    data,
    (v) => d3.mean(v, (d) => +d.Exam_Score),
    (d) => d.Motivation_Level
  );

  const formattedData = Array.from(
    groupedData,
    ([Motivation_Level, Exam_Score]) => ({ Motivation_Level, Exam_Score })
  );

  const svg = d3.select("#chart"),
    margin = { top: 40, right: 40, bottom: 80, left: 80 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  // Membuat container group untuk semua elemen chart
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand()
    .domain(formattedData.map((d) => d.Motivation_Level))
    .range([0, width])
    .padding(0.3);

  const yScale = d3
    .scaleLinear()
    .domain([55, 100]) // Skala diperbaiki agar sesuai dengan dataset
    .range([height, 0]);

  // Menambahkan garis grid horizontal untuk memudahkan pembacaan
  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""))
    .selectAll("line")
    .style("stroke", "#e0e0e0")
    .style("stroke-opacity", 0.7);

  // Hilangkan path dari grid (garis atas)
  g.select(".grid path").style("display", "none");

  // Menambahkan batang (bar) untuk setiap kategori Motivation_Level
  g.selectAll(".bar")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.Motivation_Level))
    .attr("y", (d) => yScale(d.Exam_Score))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.Exam_Score))
    .attr("fill", "royalblue")
    .attr("stroke", "#3949AB")
    .attr("stroke-width", 1);

  // Menambahkan sumbu X (bawah saja)
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "14px");

  // Menambahkan sumbu Y (kiri saja)
  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "14px");

  // Hilangkan domain path dari sumbu X dan Y (garis kanan dan atas)
  g.selectAll(".domain").style("stroke", "#333").style("stroke-width", "1");

  // Hanya tampilkan garis bawah dan kiri
  g.select("g:nth-of-type(3) .domain").attr("d", `M0,0V${height}H0`);
  g.select("g:nth-of-type(4) .domain").attr("d", `M0,${height}H${width}`);

  // Menambahkan label untuk sumbu X
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .text("Tingkat Motivasi")
    .style("font-size", "16px");

  // Menambahkan label untuk sumbu Y
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .text("Nilai Ujian")
    .style("font-size", "16px");

  // Menambahkan nilai di atas setiap bar
  g.selectAll(".bar-label")
    .data(formattedData)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => xScale(d.Motivation_Level) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.Exam_Score) - 10)
    .attr("text-anchor", "middle")
    .text((d) => d.Exam_Score.toFixed(1))
    .style("font-size", "14px")
    .style("font-weight", "bold");
});
