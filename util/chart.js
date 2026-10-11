export const calcTotal = (items) => items.reduce((a, b) => a + +b.amount, 0);

// Groups spending by category.
//
// `canonicalize` relabels the seeded defaults into the language being read, so
// a transaction recorded as "Ăn uống" and one recorded as "Food" land in the
// same slice instead of splitting the chart in two. Keys are normalised, which
// also merges case and accent variants of a user's own category.
const groupByCategory = (items, canonicalize) => {
  const grouped = new Map();

  for (const item of items) {
    const label = canonicalize(item.category);
    const key = normalizeName(label);
    if (!key) continue;

    const entry = grouped.get(key) || { label, amount: 0 };
    entry.amount += Number(item.amount || 0);
    grouped.set(key, entry);
  }

  return grouped;
};

// Assigns the integer percentage shown to the user, using the largest-remainder
// method so the displayed figures add up to exactly 100 — rounding each slice
// independently lets a part-to-whole chart read as 101% or 99%.
const withDisplayPercent = (slices) => {
  const floors = slices.map((s) => Math.floor(s.y));
  let left = 100 - floors.reduce((a, b) => a + b, 0);

  const byRemainder = slices
    .map((s, i) => ({ i, remainder: s.y - Math.floor(s.y) }))
    .sort((a, b) => b.remainder - a.remainder);

  const pct = [...floors];
  for (let k = 0; k < byRemainder.length && left > 0; k += 1, left -= 1) {
    pct[byRemainder[k].i] += 1;
  }
  return slices.map((s, i) => ({ ...s, pct: pct[i] }));
};

// Builds pie-chart slices sorted by descending share.
//
// Each slice carries:
//   key   — stable identity, NEVER the display label (see the collision note)
//   x     — the label shown to the user
//   y     — the exact share, for geometry and bar widths
//   pct   — the integer percentage shown in BOTH the donut and the legend
//
// `pct` exists so the two can never disagree: the donut used to round `y`
// itself while the legend rounded it separately.
//
// Colours are assigned from a fixed slot order after sorting, and categories
// past the last slot are folded into one "Other" slice — a 9th hue is never
// generated, which would break the one-colour-per-identity guarantee.
export const buildPieData = (items, colors, options = {}) => {
  const { otherColor = "#9CA3AF", otherLabel = "Other" } = options;
  const total = calcTotal(items);
  if (!total) return [];

  const grouped = groupByCategory(items);
  const sorted = Object.keys(grouped)
    .map((category) => ({ category, amount: grouped[category] }))
    .sort((a, b) => b.amount - a.amount);

  const toSlice = (key, label, amount, color) => ({
    key,
    x: label,
    y: (amount / total) * 100,
    color,
    total: amount,
  });

  if (sorted.length <= colors.length) {
    return withDisplayPercent(
      sorted.map((entry, index) =>
        toSlice(entry.category, entry.category, entry.amount, colors[index])
      )
    );
  }

  // Keep the top (slots - 1) categories, roll the long tail into "Other".
  const kept = sorted.slice(0, colors.length - 1);
  const tail = sorted.slice(colors.length - 1);
  const tailTotal = tail.reduce((sum, entry) => sum + entry.amount, 0);

  // The seeded category lists contain a real "Other"/"Khác". If one of those
  // survived into the kept set, the legend would show two rows reading
  // "Other"; the folded one then names how many categories it stands for.
  const collides = kept.some((entry) => entry.category === otherLabel);
  const foldLabel = collides ? `${otherLabel} (${tail.length})` : otherLabel;

  // The folded bucket gets a reserved key rather than its label: the seeded
  // category lists already contain a real "Other"/"Khác", so keying by label
  // produced two slices with the same key and the legend silently dropped a row.
  return withDisplayPercent([
    ...kept.map((entry, index) =>
      toSlice(entry.category, entry.category, entry.amount, colors[index])
    ),
    toSlice("__other__", foldLabel, tailTotal, otherColor),
  ]);
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
