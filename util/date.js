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



