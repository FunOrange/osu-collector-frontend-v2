import { useState } from 'react';

export class DisplayableError extends Error {
  constructor(
    message: string,
    public readonly childError?: Error,
  ) {
    super(message);
  }
}

const isDisplayableError = (error: unknown): error is DisplayableError => {
  return error instanceof DisplayableError;
};

export default function useSubmit<TFunction extends (...args: any[]) => Promise<void>>(_submit: TFunction) {
  const [loading, setLoading] = useState(false);
  const submit = async (...args) => {
    setLoading(true);
    try {
      await _submit.apply(null, args);
    } catch (error) {
      if (isDisplayableError(error)) {
        if (error.childError) console.error(error.childError);
        alert(error.message);
      } else {
        console.error(error);
        alert(`An unknown error occurred: ${error?.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  return [submit as TFunction, loading] as const;
}
