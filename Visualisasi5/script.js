// Memuat data CSV
d3.csv("../StudentPerformanceFactors.csv")
  .then(function (data) {
    // Konversi data numerik
    data.forEach(function (d) {
      d.Exam_Score = +d.Exam_Score;
    });

    // Kelompokkan data berdasarkan 'Peer_Influence'
    const groupedData = d3.group(data, (d) => d.Peer_Influence);

    // Dapatkan kategori yang sebenarnya ada dalam data
    const rawCategories = Array.from(groupedData.keys()).filter(Boolean);
    const actualCategories = ["Negative", "Neutral", "Positive"].filter((cat) =>
      rawCategories.includes(cat)
    );

    // Jika tidak ada data sama sekali
    if (actualCategories.length === 0) {
      console.error("Tidak ada data Peer_Influence yang valid ditemukan");
      return;
    }

    console.log("Kategori yang ditemukan:", actualCategories);

    // Set margin dan dimensi
    const margin = { top: 50, right: 40, bottom: 70, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    // Buat SVG container
    const svg = d3
      .select("#boxplot")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Skala untuk sumbu X dan Y
    const x = d3
      .scaleBand()
      .domain(actualCategories) // Menggunakan kategori yang sebenarnya ada
      .range([0, width])
      .padding(0.5);

    // Tentukan nilai sumbu Y dimulai dari 50
    const y = d3.scaleLinear().domain([50, 100]).nice().range([height, 0]);

    // Tambahkan sumbu X
    svg
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text("Pengaruh Teman Sebaya");

    // Tambahkan sumbu Y dengan interval 5
    svg
      .append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("d")))
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .text("Nilai Ujian Akhir");

    // Tambahkan judul grafik
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .text("Dampak Pengaruh Teman Sebaya terhadap Nilai Ujian");

    // Buat tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "10px")
      .style("box-shadow", "0px 0px 6px rgba(0, 0, 0, 0.3)")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Fungsi untuk menentukan outliers
    function getOutliers(values) {
      const q1 = d3.quantile(values, 0.25);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const upperBound = q3 + 1.5 * iqr;
      const lowerBound = q1 - 1.5 * iqr;

      return values.filter((d) => d < lowerBound || d > upperBound);
    }

    // Persiapkan data untuk boxplot
    const boxplotData = actualCategories.map(function (category) {
      const categoryValues = groupedData.get(category);
      const values = categoryValues.map((v) => v.Exam_Score).sort(d3.ascending);
      const count = values.length;
      const mean = d3.mean(values);

      return {
        group: category,
        q1: d3.quantile(values, 0.25),
        median: d3.quantile(values, 0.5),
        q3: d3.quantile(values, 0.75),
        min: d3.min(values),
        max: d3.max(values),
        outliers: getOutliers(values),
        count: count,
        mean: mean,
        values: values,
      };
    });

    // Buat boxplot
    const boxWidth = x.bandwidth();

    // Gambar kotak untuk setiap kategori
    boxplotData.forEach(function (d) {
      const g = svg.append("g").attr("transform", `translate(${x(d.group)},0)`);

      // Garis dari min ke max (whisker)
      g.append("line")
        .attr("class", "whisker-line")
        .attr("x1", boxWidth / 2)
        .attr("x2", boxWidth / 2)
        .attr("y1", y(d.min))
        .attr("y2", y(d.max))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.group}</strong><br/>` +
                `Range: ${d.min} - ${d.max}<br/>` +
                `Range Nilai: ${Math.round(d.max - d.min)}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Garis horizontal untuk min dan max
      g.append("line")
        .attr("class", "whisker-cap")
        .attr("x1", boxWidth / 4)
        .attr("x2", (boxWidth * 3) / 4)
        .attr("y1", y(d.min))
        .attr("y2", y(d.min))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.group}</strong><br/>` +
                `Nilai Minimum: ${d.min}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      g.append("line")
        .attr("class", "whisker-cap")
        .attr("x1", boxWidth / 4)
        .attr("x2", (boxWidth * 3) / 4)
        .attr("y1", y(d.max))
        .attr("y2", y(d.max))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.group}</strong><br/>` +
                `Nilai Maksimum: ${d.max}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Kotak untuk IQR (q1 ke q3)
      g.append("rect")
        .attr("class", "box")
        .attr("x", 0)
        .attr("y", y(d.q3))
        .attr("width", boxWidth)
        .attr("height", y(d.q1) - y(d.q3))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.group}</strong><br/>` +
                `Q1 (25%): ${Math.round(d.q1 * 10) / 10}<br/>` +
                `Median (50%): ${Math.round(d.median * 10) / 10}<br/>` +
                `Q3 (75%): ${Math.round(d.q3 * 10) / 10}<br/>` +
                `IQR: ${Math.round((d.q3 - d.q1) * 10) / 10}<br/>` +
                `Jumlah Data: ${d.count}<br/>` +
                `Rata-rata: ${Math.round(d.mean * 10) / 10}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Garis untuk median
      g.append("line")
        .attr("class", "median-line")
        .attr("x1", 0)
        .attr("x2", boxWidth)
        .attr("y1", y(d.median))
        .attr("y2", y(d.median))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.group}</strong><br/>` +
                `Median: ${Math.round(d.median * 10) / 10}<br/>` +
                `50% dari nilai berada di atas angka ini`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Tambahkan outliers sebagai titik
      d.outliers.forEach(function (outlier) {
        g.append("circle")
          .attr("class", "outlier")
          .attr("cx", boxWidth / 2)
          .attr("cy", y(outlier))
          .attr("r", 3)
          .on("mouseover", function (event) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
              .html(
                `<strong>Kategori: ${d.group}</strong><br/>` +
                  `Outlier: ${outlier}<br/>` +
                  `Nilai ini berada di luar rentang normal distribusi`
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
          });
      });
    });

    // Tambahkan garis tren untuk median
    const medians = actualCategories.map((cat) => {
      const values = groupedData
        .get(cat)
        .map((d) => d.Exam_Score)
        .sort(d3.ascending);
      return {
        category: cat,
        value: d3.quantile(values, 0.5),
      };
    });

    // Tambahkan garis tren median
    const linePath = d3
      .line()
      .x((d) => x(d.category) + x.bandwidth() / 2)
      .y((d) => y(d.value));

    svg
      .append("path")
      .datum(medians)
      .attr("class", "trend-line")
      .attr("d", linePath)
      .on("mouseover", function (event) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<strong>Garis Tren Median</strong><br/>` +
              `Menunjukkan perubahan nilai median antar kategori`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Tambahkan label untuk nilai median pada setiap kategori
    medians.forEach((d) => {
      svg
        .append("text")
        .attr("class", "median-value")
        .attr("x", x(d.category) + x.bandwidth() / 2)
        .attr("y", y(d.value) - 10)
        .attr("text-anchor", "middle")
        .text(Math.round(d.value))
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `<strong>Kategori: ${d.category}</strong><br/>` +
                `Nilai Median: ${Math.round(d.value)}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });
    });

    // Tambahkan keterangan warna (legend)
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120}, ${height - 80})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 120)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("rx", 5)
      .attr("ry", 5);

    legend
      .append("rect")
      .attr("x", 10)
      .attr("y", 15)
      .attr("width", 15)
      .attr("height", 15)
      .attr("class", "box")
      .style("fill", "#69b3a2")
      .style("opacity", 0.5);

    legend
      .append("line")
      .attr("x1", 10)
      .attr("x2", 25)
      .attr("y1", 45)
      .attr("y2", 45)
      .attr("class", "median-line");

    legend
      .append("circle")
      .attr("cx", 17.5)
      .attr("cy", 65)
      .attr("r", 3)
      .attr("class", "outlier");

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 25)
      .text("IQR (25-75%)")
      .style("font-size", "10px");

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 45)
      .text("Median")
      .style("font-size", "10px");

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 65)
      .text("Outlier")
      .style("font-size", "10px");
  })
  .catch(function (error) {
    console.log("Error loading data:", error);
  });

// Tambahkan CSS untuk styling
const style = document.createElement("style");
style.textContent = `
  .box {
    fill: #69b3a2;
    opacity: 0.5;
    stroke: #3D5A80;
    stroke-width: 1px;
  }
  .whisker-line {
    stroke: #3D5A80;
    stroke-width: 1px;
  }
  .whisker-cap {
    stroke: #3D5A80;
    stroke-width: 1px;
  }
  .median-line {
    stroke: #E56B6F;
    stroke-width: 2px;
  }
  .outlier {
    fill: #E56B6F;
  }
  .trend-line {
    stroke: #355070;
    stroke-width: 2px;
    stroke-dasharray: 4;
    fill: none;
  }
  .median-value {
    font-size: 10px;
    font-weight: bold;
  }
  .chart-title {
    font-size: 16px;
    font-weight: bold;
  }
  .axis-label {
    font-size: 12px;
    font-weight: bold;
  }
`;
document.head.appendChild(style);
