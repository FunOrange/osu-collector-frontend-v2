export const swrKeyIncludes = (target: string) => (key: any) => {
  if (Array.isArray(key) && key.length > 0 && typeof key[0] === 'string') {
    return key[0].includes(target);
  } else if (typeof key === 'string') {
    return key.includes(target);
  }
  return false;
};
