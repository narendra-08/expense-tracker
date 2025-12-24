import Chart from "chart.js/auto";

let chartInstance = null;

export function renderIncomeExpenseChart(canvas, income, expense) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        label: "Amount (₹)",
        data: [income, expense],
        backgroundColor: ["#34d399", "#fb7185"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
