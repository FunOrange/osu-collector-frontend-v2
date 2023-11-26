export const getUrlSlug = (str) => encodeURIComponent(str?.replace(/ /g, "-"));

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
