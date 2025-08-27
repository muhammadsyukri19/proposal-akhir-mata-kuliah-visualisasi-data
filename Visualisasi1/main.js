// Baca CSV dan buat chart
Papa.parse("../StudentPerformanceFactors.csv", {
  download: true,
  header: true,
  complete: function (results) {
    const data = results.data;

    const scatterData = data
      .filter((d) => d.Hours_Studied && d.Exam_Score)
      .map((d) => ({
        x: parseFloat(d.Hours_Studied),
        y: parseFloat(d.Exam_Score),
      }));

    // Hitung regresi linear sederhana (y = a + bx)
    const n = scatterData.length;
    const sumX = scatterData.reduce((acc, point) => acc + point.x, 0);
    const sumY = scatterData.reduce((acc, point) => acc + point.y, 0);
    const sumXY = scatterData.reduce(
      (acc, point) => acc + point.x * point.y,
      0
    );
    const sumX2 = scatterData.reduce(
      (acc, point) => acc + point.x * point.x,
      0
    );

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Buat dua titik untuk garis regresi (dari min x ke max x)
    const xMin = Math.min(...scatterData.map((p) => p.x));
    const xMax = Math.max(...scatterData.map((p) => p.x));
    const regressionLine = [
      { x: xMin, y: slope * xMin + intercept },
      { x: xMax, y: slope * xMax + intercept },
    ];

    const ctx = document.getElementById("scatterChart").getContext("2d");

    new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Jam Belajar vs Nilai Ujian",
            data: scatterData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            pointRadius: 5,
          },
          {
            label: "Garis Regresi Linear",
            data: regressionLine,
            type: "line",
            borderColor: "rgb(0, 85, 77)",
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Korelasi Jam Belajar dan Nilai Ujian",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Jam: ${context.parsed.x}, Nilai: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Jam Belajar (Hours_Studied)",
            },
            min: 0,
          },
          y: {
            title: {
              display: true,
              text: "Nilai Ujian (Exam_Score)",
            },
            min: 0,
          },
        },
      },
    });
  },
});
