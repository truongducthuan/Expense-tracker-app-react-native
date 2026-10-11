export function getFormatDate(time) {
  const date = new Date(time)
  if(date) {
    return `${date.getFullYear()}-${
      date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)
    }-${date.getDate() >= 10 ? date.getDate() : "0" + date.getDate()}`;
  }
}

export function getDateMinuteDays(date, days) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate() - days
  );
}

export function getFollowWeek(date, data) {
  const start = getStartOfWeek(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return data.filter((e) => {
    const itemDate = new Date(e.date);
    return itemDate >= start && itemDate <= end;
  });
}

export function getFollowMonth(month, data) {
  const result = data.filter((e) => {
    if(+getFormatDate(e.date).slice(5, 7) == +month && +getFormatDate(e.date).slice(0, 4) == new Date().getFullYear())
    return e
  });
  return result;
}

export function getFollowYear(date, data) {
  const result = data.filter((e) => {
    return e.year === +date;
  });
  return result;
}

export function getStartOfWeek(date) {
  const now = new Date(date);
  const day = now.getDay();
  const diff = now.getDate() - day + (day == 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

export function getEndOfWeek(date) {
  const now = new Date(date);
  const day = now.getDay();
  const diff = now.getDate() + 7 - day;
  return new Date(now.setDate(diff));
}

// Day key (YYYY-MM-DD) used to bucket transactions into day sections.
export function getDayKey(time) {
  return getFormatDate(time);
}

// Human day label: "Today"/"Yesterday" for the two most recent days, otherwise
// a short day-and-month. Labels are localised by the caller via `labels`.
export function getDayLabel(dayKey, labels = {}) {
  const todayKey = getFormatDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dayKey === todayKey) return labels.today || "Today";
  if (dayKey === getFormatDate(yesterday)) return labels.yesterday || "Yesterday";

  const [year, month, day] = dayKey.split("-");
  const thisYear = String(new Date().getFullYear());
  return year === thisYear ? `${day}/${month}` : `${day}/${month}/${year}`;
}

// Groups transactions into day sections, newest day first, for a SectionList.
// Each section carries the day's net total so the header can show it
// (Gestalt — Proximity: same-day rows read as one block).
export function groupByDay(items = [], labels = {}) {
  const buckets = new Map();

  for (const item of items) {
    const key = getDayKey(item.date);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  }

  return [...buckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, data]) => ({
      key,
      title: getDayLabel(key, labels),
      net: data.reduce((sum, item) => {
        const amount = Number(item.amount || 0);
        if (item.type === "income") return sum + amount;
        if (item.type === "expense") return sum - amount;
        return sum;
      }, 0),
      data: [...data].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }));
}

// Filters items by the selected period ("weekly" | "monthly" | "yearly").
export function filterByPeriod(items, period, currTimeValue) {
  const today = new Date();
  switch (period.toLowerCase()) {
    case "weekly":
      return getFollowWeek(today, items);
    case "monthly":
      return getFollowMonth(currTimeValue, items);
    case "yearly":
      return getFollowYear(currTimeValue, items);
    default:
      return items;
  }
}



