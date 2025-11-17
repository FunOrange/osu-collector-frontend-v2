export const getRandomFromArray = (items) => items[Math.floor(Math.random() * items.length)];

export const unorderedArrayEquals = <T>(a: T[] | undefined, b: T[] | undefined) => {
  if (a?.length !== b?.length) return false;
  return a?.every((item) => b?.includes(item));
};

export const toggleArrayItem = <T>(array: T[], item: T) => {
  if (array?.includes(item)) return array?.filter((i) => i !== item);
  return [...(array ?? []), item];
};
