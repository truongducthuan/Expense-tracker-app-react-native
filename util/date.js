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
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  const result = data.filter((e) => {
    const getDay = new Date(e.date).getDate();
    if(getDay <= (endOfWeek.getDate() + 1) && (getDay >= startOfWeek.getDate()) && new Date(e.date).getFullYear() == new Date().getFullYear() && (new Date(e.date).getMonth() == new Date().getMonth())) {
      return e
    }
  });
  return result;
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



