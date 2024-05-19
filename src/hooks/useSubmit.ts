import { useState } from 'react';

export default function useSubmit<TFunction extends (...args: any[]) => Promise<void>>(_submit: TFunction) {
  const [loading, setLoading] = useState(false);
  const submit = async (...args) => {
    setLoading(true);
    try {
      await _submit.apply(null, args);
    } catch (error) {
      console.error(error);
      alert('An unknown error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  return [submit as TFunction, loading] as const;
}
