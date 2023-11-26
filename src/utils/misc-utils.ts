export default function fallbackOnError(ev, fallbackImg) {
  if (ev.target.src === fallbackImg) {
    return;
  }
  ev.target.err = null;
  ev.target.src = fallbackImg;
}
