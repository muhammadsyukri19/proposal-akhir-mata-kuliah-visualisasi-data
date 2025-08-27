// Load the CSV file and parse it
Plotly.d3.csv("../StudentPerformanceFactors.csv", function (err, rows) {
  if (err) throw err;

  const incomeLevels = ["Low", "Medium", "High"];
  const colors = {
    Low: "#EF553B", // Merah
    Medium: "#00CC96", // Hijau
    High: "#AB63FA", // Ungu
  };

  const traces = incomeLevels.map((level) => {
    return {
      type: "violin",
      x: rows.filter((row) => row.Family_Income === level).map(() => level),
      y: rows
        .filter((row) => row.Family_Income === level)
        .map((row) => parseFloat(row.Exam_Score)),
      name: level,
      box: { visible: true },
      meanline: { visible: true },
      line: { color: colors[level] },
      fillcolor: colors[level],
      opacity: 0.6,
    };
  });

  const layout = {
    title: "Violin Plot: Exam Score vs Family Income",
    yaxis: {
      title: "Exam Score",
      zeroline: false,
    },
    xaxis: {
      title: "Family Income",
    },
  };

  Plotly.newPlot("violin-plot", traces, layout);
});
