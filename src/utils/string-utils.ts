export const getUrlSlug = (str: string) => encodeURIComponent(str?.replace(/ /g, "-"));

export const s = (count: number, single = "", plural = "s") => (count === 1 ? single : plural);

export const formatQueryParams = (query) => {
  try {
    const _query = { ...query };
    Object.keys(_query)
      .filter((key) => _query[key] === undefined)
      .forEach((key) => delete _query[key]);
    return new URLSearchParams(_query).toString();
  } catch (error) {
    console.error(error);
    return null;
  }
};
