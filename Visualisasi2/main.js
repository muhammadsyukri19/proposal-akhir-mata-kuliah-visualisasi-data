d3.csv("../StudentPerformanceFactors.csv").then((data) => {
  data.forEach((d) => {
    d.Exam_Score = +d.Exam_Score;
  });

  const grouped = d3.group(data, (d) => d.Parental_Involvement);
  const categories = Array.from(grouped.keys());

  const margin = { top: 30, right: 30, bottom: 60, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(categories).range([0, width]).padding(0.4);

  const y = d3.scaleLinear().domain([50, 100]).nice().range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  categories.forEach((category) => {
    const scores = grouped
      .get(category)
      .map((d) => d.Exam_Score)
      .sort(d3.ascending);

    const q1 = d3.quantile(scores, 0.25);
    const median = d3.quantile(scores, 0.5);
    const q3 = d3.quantile(scores, 0.75);
    const IQR = q3 - q1;

    const lowerWhisker = d3.max([d3.min(scores), q1 - 1.5 * IQR]);
    const upperWhisker = d3.min([d3.max(scores), q3 + 1.5 * IQR]);

    const center = x(category) + x.bandwidth() / 2;
    const boxWidth = 50;

    // Box
    svg
      .append("rect")
      .attr("x", center - boxWidth / 2)
      .attr("y", y(q3))
      .attr("height", y(q1) - y(q3))
      .attr("width", boxWidth)
      .attr("fill", "#3498db")
      .attr("opacity", 0.6);

    // Median line
    svg
      .append("line")
      .attr("x1", center - boxWidth / 2)
      .attr("x2", center + boxWidth / 2)
      .attr("y1", y(median))
      .attr("y2", y(median))
      .attr("stroke", "#1A5276")
      .attr("stroke-width", 2);

    // Whiskers
    svg
      .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(lowerWhisker))
      .attr("y2", y(upperWhisker))
      .attr("stroke", "#333");

    // Whisker caps
    [lowerWhisker, upperWhisker].forEach((v) => {
      svg
        .append("line")
        .attr("x1", center - boxWidth / 4)
        .attr("x2", center + boxWidth / 4)
        .attr("y1", y(v))
        .attr("y2", y(v))
        .attr("stroke", "#333");
    });

    // Outliers
    scores.forEach((score) => {
      if (score < lowerWhisker || score > upperWhisker) {
        svg
          .append("circle")
          .attr("cx", center)
          .attr("cy", y(score))
          .attr("r", 3)
          .attr("fill", "#1A5276")
          .attr("opacity", 0.8);
      }
    });

    // Median label
    svg
      .append("text")
      .attr("x", center)
      .attr("y", y(median) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#1A5276")
      .text(median.toFixed(0));
  });

  // Axis Labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Parental Involvement");

  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Exam Score");
});
