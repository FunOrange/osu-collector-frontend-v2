import { Tournament } from '@/shared/entities/v1/Tournament';
import { dropdownPropsGeneric, formItemPropsGeneric, inputPropsGeneric } from '@/utils/form-props';
import rules, { ValidationRule, checkRuleAndSetError } from '@/utils/form-validation-rules';
import { useState } from 'react';

interface TournamentFormFields {
  name: string;
  link: string;
  banner: string;
  downloadUrl: string;
  description: string;
}
export default function useTournamentForm(
  tournament?: Tournament,
  tournamentDraft?: TournamentFormFields,
  afterChange?: () => void,
) {
  const [touchedFields, _setTouchedFields] = useState<Partial<TournamentFormFields>>({});
  const fields: TournamentFormFields = {
    name: tournament?.name ?? tournamentDraft?.name ?? '',
    link: tournament?.link ?? tournamentDraft?.link ?? '',
    banner: tournament?.banner ?? tournamentDraft?.banner ?? '',
    downloadUrl: tournament?.downloadUrl ?? tournamentDraft?.downloadUrl ?? '',
    description: tournament?.description ?? tournamentDraft?.description ?? '',
    ...touchedFields,
  };
  const setTouchedFields = (...args) => {
    afterChange?.();
    _setTouchedFields.apply(null, args);
  };

  const [errors, setErrors] = useState<{ [P in keyof TournamentFormFields]?: string }>({});

  const validateWithRules = (fieldName: keyof TournamentFormFields, rules: ValidationRule[]) => () =>
    rules.every((rule) => checkRuleAndSetError(rule, fields, fieldName, setErrors) === true);
  const validate = {
    name: validateWithRules('name', [rules.required(), rules.notBlank(), rules.minLength(2), rules.maxLength(256)]),
    link: validateWithRules('link', [
      rules.required(),
      rules.notBlank(),
      rules.maxLength(2048),
      rules.url(),
      rules.matchesRegex(
        /^https:\/\/((\w+\.)?ppy\.sh|docs\.google\.com)\//,
        'Only osu.ppy.sh forum or google doc links or are accepted',
      ),
    ]),
    banner: validateWithRules('banner', [
      rules.notBlank(),
      rules.url(),
      rules.matchesRegex(
        /^https:\/\/i\.ppy\.sh/,
        'For security reasons, only URLs originating from https://i.ppy.sh are accepted. Please use the "Copy image address" method described below.',
      ),
    ]),
    downloadUrl: validateWithRules('downloadUrl', [rules.url()]),
    description: validateWithRules('description', [rules.maxLength(5000)]),
    all: () => {
      const validators = Object.entries(validate)
        .filter(([key]) => key !== 'all')
        .map(([key, value]) => value);
      return validators.map((validator) => validator()).every((valid) => valid === true);
    },
  };

  const inputProps = inputPropsGeneric<TournamentFormFields>({
    fields,
    setTouchedFields,
    errors,
    setErrors,
    validate,
  });
  const formItemProps = formItemPropsGeneric<TournamentFormFields>({ errors });
  const dropdownProps = dropdownPropsGeneric<TournamentFormFields>({
    fields,
    setTouchedFields,
    setErrors,
  });
  return { fields, touchedFields, setTouchedFields, validate, formItemProps, inputProps, dropdownProps };
}
