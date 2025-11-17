import { Result } from '@/utils/try-catch';

export const JSONParse = <T>(json: string | undefined): Result<T | undefined, SyntaxError> => {
  if (json === undefined) return [undefined, null];
  try {
    return [JSON.parse(json), null];
  } catch (error) {
    return [null, error as SyntaxError];
  }
};
