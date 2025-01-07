export type ValidationRule = (input: string) => { valid: boolean; errorMessage?: any };

export const checkRuleAndSetError = (rule: ValidationRule, fields: any, fieldName: string, setErrors: any) => {
  const { valid, errorMessage } = rule(fields[fieldName]);
  if (!valid) {
    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
  }
  return valid;
};
export const rule = (errorCondition, errorMessage) => {
  return (input) => {
    if (errorCondition(input)) {
      return { valid: false, errorMessage };
    }
    return { valid: true };
  };
};
const rules = {
  required: (options = { acceptNull: false }) =>
    rule(
      (input) => input === '' || input === undefined || (!options.acceptNull && input === null),
      'This field is required',
    ),
  requiredWhen: (condition: boolean) =>
    rule((input) => condition && (input === '' || input === undefined), 'This field is required'),
  requiredAndNotNullWhen: (condition: boolean) =>
    rule((input) => condition && (input === '' || input === undefined || input === null), 'This field is required'),
  notBlank: () => rule((input) => /^\s+$/.test(input), 'This field cannot consist of blank spaces'),
  number: () => rule((input) => input !== '' && isNaN(Number(input)), 'Must be a number'),
  integer: () => rule((input) => input !== '' && !Number.isInteger(Number(input)), 'Must be a whole number'),
  nonNegative: () => rule((input) => input !== '' && Number(input) < 0, 'Must be a positive number'),
  positive: () => rule((input) => input !== '' && Number(input) <= 0, 'Must be a positive number'),
  max: (max: number) =>
    rule((input) => input !== '' && Number(input) >= max, `Must be less than ${(max + 1).toLocaleString()}`),
  min: (min: number) =>
    rule((input) => input !== '' && Number(input) <= min, `Must be greater than ${(min - 1).toLocaleString()}`),
  minLength: (min: number) =>
    rule((input) => input.trim().length > 0 && input.trim().length < min, `Must be at least ${min} characters`),
  maxLength: (max: number) => rule((input) => input.length > max, `Must be less than ${max} characters`),
  email: () => rule((input) => !/^[\w\-\.]+(\+[\d\w]+)?@[a-z]+\.[a-z]{2,3}$/.test(input), 'Not a valid email address'),
  emailWithoutDomain: () => rule((input) => input.includes('@'), 'Please use the dropdown for @'),
  emailUsername: () => rule((input) => !/^[\w-\.]+(\+\d+)?$/.test(input), 'Not a valid email address'),
  phone: () =>
    rule(
      (input) => !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{4,6}[)]?$/im.test(input),
      'Not a valid phone number',
    ),
  suppliedByGoogleAutocomplete: () => rule((input) => !input.trim(), 'Please use Address Line 1 to select an address'),
  hasCapitalLetter: () => rule((input) => !/[A-Z]/.test(input), 'Must contain a capital letter'),
  hasLowercaseLetter: () => rule((input) => !/[a-z]/.test(input), 'Must contain a lowercase letter'),
  hasNumber: () => rule((input) => !/\d/.test(input), 'Must contain a number'),
  hasSpecialChar: () =>
    rule((input) => !/\W/.test(input), 'Must contain one of the following special characters: !?@#$%^&*-_'),
  matches: (target, errorMessage) => rule((input) => input !== target, errorMessage),
  noSpecialChars: () => rule((input) => /[!?@#$%^&\*\-_]/.test(input), 'Must not contain any special characters'),
  noNumbers: () => rule((input) => /\d/.test(input), 'Must not contain numbers'),
  url: () => rule((input) => input && !/^(http|https):\/\/[^ "]+$/.test(input), 'Not a valid URL'),
  matchesRegex: (regex, errorMessage) => rule((input) => input && !regex.test(input), errorMessage),
};
export default rules;
