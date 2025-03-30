export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
export const ONE_MEGABYTE = 1024 * 1024;

export const calculateOverlap = (target: [number, number], value: [number, number]) => {
  const [tStart, tEnd] = target;
  const [vStart, vEnd] = value;
  const overlapStart = Math.max(tStart, vStart);
  const overlapEnd = Math.min(tEnd, vEnd);
  const overlapLength = Math.max(0, overlapEnd - overlapStart);
  const targetLength = tEnd - tStart;
  return targetLength > 0 ? overlapLength / targetLength : 0;
};
