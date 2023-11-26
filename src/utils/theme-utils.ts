import { clamp } from "@/utils/number-utils";

export function bpmToColor(bpm, darkMode = true) {
  const _bpm = clamp(Math.floor(bpm / 10) * 10, 150, 300);
  if (_bpm === 150) return "#93e2ff";
  if (_bpm === 160) return "#80dbff";
  if (_bpm === 170) return "#6bd3fe";
  if (_bpm === 180) return "#55cbff";
  if (_bpm === 190) return "#39c3ff";
  if (_bpm === 200) return "#00bbff";
  if (_bpm === 210) return "#00a8ea";
  if (_bpm === 220) return "#0095d6";
  if (_bpm === 230) return "#0082c2";
  if (_bpm === 240) return "#0070ae";
  if (_bpm === 250) return "#005f9b";
  if (_bpm === 260) return "#004e88";
  if (_bpm === 270) return "#003e76";
  if (_bpm === 280) return "#002e64";
  if (_bpm === 290) return "#002052";
  if (_bpm === 300) return darkMode ? "#fff" : "#000000";
  return "#000000";
}

export function starToColor(star, darkMode = false) {
  const _star = clamp(Math.floor(star), 1, 10);
  if (_star === 1) return "#6EFF79";
  if (_star === 2) return "#4FC0FF";
  if (_star === 3) return "#F8DA5E";
  if (_star === 4) return "#FF7F68";
  if (_star === 5) return "#FF4E6F";
  if (_star === 6) return "#A653B0";
  if (_star === 7) return "#3B38B2";
  if (_star === 8) return darkMode ? "#fff" : "#000000";
  if (_star === 9) return darkMode ? "#fff" : "#000000";
  if (_star === 10) return darkMode ? "#fff" : "#000000";
  return darkMode ? "#fff" : "#000000";
}
