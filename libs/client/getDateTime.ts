export function getDateTime(createdAt: string) {
  if (!createdAt) {
    return {year: null, month: null, day: null, hour: null, minute: null};
  }
  let [date, time] = createdAt.split('T');
  let [year, month, day] = date.split('-');
  let [hour, minute] = time.split(':');
  
  return {year, month, day, hour, minute};
}
