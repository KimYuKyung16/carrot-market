export function getDateTime(createdAt: string) {
  let [date, time] = createdAt.split('T');
  let [year, month, day] = date.split('-');
  let [hour, minute] = time.split(':');
  
  return {year, month, day, hour, minute};
}
