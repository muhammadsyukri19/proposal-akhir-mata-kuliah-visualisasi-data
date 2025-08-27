// Definisikan dimensi untuk chart
const width = 450,
  height = 450,
  margin = 40;
const radius = Math.min(width, height) / 2 - margin;

// Buat SVG container
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Definisikan warna untuk setiap jenis sekolah
const color = d3.scaleOrdinal().range(["#4472c4", "#ed7d31"]); // Negeri, Swasta

// Format persentase
const formatPercent = d3.format(".1f");

// Load data CSV
d3.csv("../StudentPerformanceFactors.csv")
  .then(function (data) {
    console.log("Raw data loaded:", data);

    // Validasi data
    if (!data || data.length === 0) {
      throw new Error("Dataset kosong atau tidak valid");
    }

    // Filter hanya siswa dengan nilai tinggi
    const filtered = data.filter((d) => d.Kategori_Nilai === "Tinggi");
    console.log("Filtered data:", filtered);

    // Validasi data yang difilter
    if (filtered.length === 0) {
      throw new Error("Tidak ada data dengan Kategori_Nilai 'Tinggi'");
    }

    // Hitung jumlah untuk setiap jenis sekolah
    let schoolCounts = {};
    filtered.forEach((item) => {
      if (!schoolCounts[item.School_Type]) {
        schoolCounts[item.School_Type] = 0;
      }
      schoolCounts[item.School_Type]++;
    });

    // Hitung total untuk persentase
    const total = Object.values(schoolCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    // Konversi ke format array untuk d3.pie dengan persentase
    const pieData = Object.keys(schoolCounts).map((key) => ({
      label: key,
      value: schoolCounts[key],
      percentage: (schoolCounts[key] / total) * 100,
    }));

    console.log("Pie data:", pieData);

    // Validasi data pie
    if (pieData.length === 0) {
      throw new Error("Tidak ada data yang dapat divisualisasikan");
    }

    // Set domain warna berdasarkan label sekolah
    color.domain(pieData.map((d) => d.label));

    // Buat fungsi pie (menggunakan persentase untuk nilai)
    const pie = d3.pie().value((d) => d.percentage);

    // Data yang sudah diproses untuk pie chart
    const data_ready = pie(pieData);
    console.log("Processed pie data:", data_ready);

    // Buat generator arc untuk path
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    // Tambahkan path untuk setiap slice
    svg
      .selectAll("path")
      .data(data_ready)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => color(d.data.label))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Tambahkan label ke setiap slice
    svg
      .selectAll("text")
      .data(data_ready)
      .enter()
      .append("text")
      .text((d) => `${formatPercent(d.data.percentage)}%`)
      .attr("transform", (d) => {
        const pos = arcGenerator.centroid(d);
        return `translate(${pos[0]},${pos[1]})`;
      })
      .style("text-anchor", "middle")
      .style("font-size", 14)
      .style("fill", "white");

    // Buat legenda
    const legendContainer = d3.select("#legend");
    legendContainer.html(""); // Bersihkan legenda sebelumnya jika ada

    pieData.forEach((item, i) => {
      const legendRow = legendContainer
        .append("div")
        .attr("class", "legend-item");

      legendRow
        .append("div")
        .attr("class", "legend-color")
        .style("background-color", color(item.label));

      legendRow
        .append("span")
        .text(
          `${item.label}: ${formatPercent(item.percentage)}% (${item.value})`
        );
    });
  })
  .catch(function (error) {
    console.error("Error loading or processing data:", error);

    // Tampilkan pesan error
    d3.select("#chart")
      .append("div")
      .attr("class", "error-message")
      .text("Error: " + error.message);
  });
