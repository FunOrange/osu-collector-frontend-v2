import { Result } from "@/utils/try-catch";

export const JSONParse = <T>(json: string): Result<T, SyntaxError> => {
  try {
    return [JSON.parse(json), null];
  } catch (error) {
    return [null, error as SyntaxError];
  }
}
