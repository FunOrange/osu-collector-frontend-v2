export const getUrlSlug = (str: string) => encodeURIComponent(str?.replace(/ /g, '-'));

export const s = (count: number, single = '', plural = 's') => (count === 1 ? single : plural);

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

export const validateEmail = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );

export function safe(strings: TemplateStringsArray, ...values: any[]): string | undefined {
  if (values.some((value) => value === undefined)) {
    return undefined;
  }
  return String.raw(strings, ...values);
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
