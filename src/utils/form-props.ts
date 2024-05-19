import { mergeLeft, omit } from 'ramda';
import { Dispatch, SetStateAction } from 'react';

type PropConfig = {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
};
export const inputPropsGeneric = <T>(context: {
  fields: T;
  setTouchedFields: Dispatch<SetStateAction<Partial<T>>>;
  errors: { [P in keyof T]?: string };
  setErrors: Dispatch<SetStateAction<{ [P in keyof T]?: string }>>;
  validate: { [P in keyof T]?: () => boolean };
}) => {
  const { fields, setTouchedFields, errors, setErrors, validate } = context;
  return <TValue>(fieldName: keyof T, options?: PropConfig) => ({
    value: fields[fieldName] as TValue,
    onChange: (e) => {
      setTouchedFields(mergeLeft({ [fieldName]: e.target.value }));
      // clear error when field is modified
      // @ts-ignore:next-line
      setErrors(omit([fieldName]));
      if (options?.validateOnChange) {
        validate?.[fieldName]?.();
      }
    },
    onBlur: options?.validateOnBlur ? validate[fieldName] : undefined,
    error: errors?.[fieldName] || null,
  });
};

export const dropdownPropsGeneric = <T>(context: {
  fields: T;
  setTouchedFields: Dispatch<SetStateAction<Partial<T>>>;
  setErrors: Dispatch<SetStateAction<{ [P in keyof T]?: string }>>;
}) => {
  const { fields, setTouchedFields, setErrors } = context;
  return (fieldName: keyof T) => ({
    value: fields[fieldName],
    onChange: (value: string) => {
      setTouchedFields(mergeLeft({ [fieldName]: value }));
      // clear error when field is modified
      // @ts-ignore:next-line
      setErrors(omit([fieldName]));
    },
  });
};

export const datePickerPropsGeneric = <T>(context: {
  fields: T;
  setTouchedFields: Dispatch<SetStateAction<Partial<T>>>;
  setErrors: Dispatch<SetStateAction<{ [P in keyof T]?: string }>>;
}) => {
  const { fields, setTouchedFields, setErrors } = context;
  return (fieldName: keyof T) => ({
    value: fields[fieldName] as string,
    onChange: (_, dateString: string) => {
      setTouchedFields(mergeLeft({ [fieldName]: dateString }));
      // clear error when field is modified
      // @ts-ignore:next-line
      setErrors(omit([fieldName]));
    },
  });
};

export const numberInputPropsGeneric = <T>(context: {
  fields: T;
  setTouchedFields: Dispatch<SetStateAction<Partial<T>>>;
  errors: { [P in keyof T]?: string };
  setErrors: Dispatch<SetStateAction<{ [P in keyof T]?: string }>>;
}) => {
  const { fields, setTouchedFields, errors, setErrors } = context;
  return (fieldName: keyof T, options?: PropConfig) => ({
    value: fields[fieldName] as number,
    error: errors[fieldName],
    onChange: (value: number) => {
      setTouchedFields(mergeLeft({ [fieldName]: value }));
      // clear error when field is modified
      // @ts-ignore:next-line
      setErrors(omit([fieldName]));
    },
  });
};

export const formItemPropsGeneric = <T>(context: { errors: { [P in keyof T]?: string } }) => {
  const { errors } = context;
  return (fieldName: keyof T) => ({
    style: { margin: 0 },
    validateStatus: errors[fieldName] ? 'error' : undefined,
    help: errors[fieldName] || undefined,
  });
};
