export const getRandomFromArray = (items) => items[Math.floor(Math.random() * items.length)];

export const unorderedArrayEquals = <T>(a: T[], b: T[]) => {
  if (a?.length !== b?.length) return false;
  return a?.every((item) => b?.includes(item));
};
