(async function () {
  const data = [
    { day: 6, month: 8, year: 2025, count: 10 },
    { day: 27, month: 8, year: 2025, count: 19 },
    { day: 8, month: 9, year: 2025, count: 25 },
    { day: 29, month: 9, year: 2025, count: 20 },
    { day: 10, month: 10, year: 2025, count: 30 },
    { day: 20, month: 10, year: 2025, count: 37 },
  ];
  Chart.defaults.elements.line.tension=0.3;
  Chart.defaults.backgroundColor = '#0090ff';
Chart.defaults.borderColor = '#0090ff';
  new Chart(document.getElementById("perfchart"), {
    type: "line",
    data: {
      labels: data.map(
        (row) =>
          `${row.day} ${
            [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ][row.month - 1]
          } ${row.year % 100}`
      ),
      datasets: [
        {
          label: "Avg. Score",
          data: data.map((row) => row.count),
        },
      ],
    },
  });
})();
