export const calcTotal = (items) => items.reduce((a, b) => a + +b.amount, 0);

const groupByCategory = (items) => {
  const grouped = {};
  for (const item of items) {
    grouped[item.category] = (grouped[item.category] || 0) + Number(item.amount);
  }
  return grouped;
};

// Builds pie-chart slices ({ x, y, color, total }) sorted by descending share.
export const buildPieData = (items, colors) => {
  const total = calcTotal(items);
  const grouped = groupByCategory(items);
  const data = Object.keys(grouped).map((category, index) => ({
    x: category,
    y: +((grouped[category] / total) * 100).toFixed(2),
    color: colors[index],
    total: grouped[category],
  }));
  return data.sort((a, b) => b.y - a.y);
};

// Builds bar-chart points ({ x, y }) from submitted todo summaries.
export const buildTodoBarData = (items, period) => {
  return items.map((item) => {
    const date = new Date(item.date);
    const x =
      period.toLowerCase() === "yearly" ? date.getMonth() + 1 : date.getDate();
    return { x: +x, y: +item.percent };
  });
};
