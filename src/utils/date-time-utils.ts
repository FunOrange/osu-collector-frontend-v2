export function secondsToHHMMSS(sec_num) {
  const sec = Math.round(sec_num);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - hours * 3600) / 60);
  let seconds = sec - hours * 3600 - minutes * 60;

  if (hours < 10) {
    // @ts-ignore
    hours = '0' + hours;
  }
  if (minutes < 10 && hours > 0) {
    // @ts-ignore
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    // @ts-ignore
    seconds = '0' + seconds;
  }

  return hours > 0 ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
}
