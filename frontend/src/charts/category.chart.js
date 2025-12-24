import Chart from "chart.js/auto";

let categoryChart = null;

export function renderCategoryChart(canvas, categoryMap) {
  if (categoryChart) {
    categoryChart.destroy();
  }

  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  categoryChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(
          (_, i) => `hsl(${i * 60},70%,60%)`
        )
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
