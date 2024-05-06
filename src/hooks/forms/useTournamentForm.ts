import { dropdownPropsGeneric, formItemPropsGeneric, inputPropsGeneric } from "@/utils/form-props";
import rules, { ValidationRule, checkRuleAndSetError } from "@/utils/form-validation-rules";
import { useState } from "react";

interface TournamentFormFields {
  name: string;
  link: string;
  banner: string;
  downloadUrl: string;
  description: string;
  organizers: { id: number; username: string }[];
  mappoolText: string;
}
export default function useTournamentForm(email?: string) {
  const [fields, setFields] = useState<TournamentFormFields>({
    name: "",
    link: "",
    banner: "",
    downloadUrl: "",
    description: "",
    organizers: [],
    mappoolText: "",
  });
  const [errors, setErrors] = useState<{ [P in keyof TournamentFormFields]?: string }>({});

  const validateWithRules =
    (fieldName: keyof TournamentFormFields, rules: ValidationRule[]) => () =>
      rules.every((rule) => checkRuleAndSetError(rule, fields, fieldName, setErrors) === true);
  const validate = {
    name: validateWithRules("name", [
      rules.required(),
      rules.notBlank(),
      rules.minLength(2),
      rules.maxLength(256),
    ]),
    all: () => {
      const validators = Object.entries(validate)
        .filter(([key]) => key !== "all")
        .map(([key, value]) => value);
      return validators.map((validator) => validator()).every((valid) => valid === true);
    },
  };

  const inputProps = inputPropsGeneric<TournamentFormFields>({
    fields,
    setTouchedFields: setFields,
    errors,
    setErrors,
    validate,
  });
  const formItemProps = formItemPropsGeneric<TournamentFormFields>({ errors });
  const dropdownProps = dropdownPropsGeneric<TournamentFormFields>({
    fields,
    setTouchedFields: setFields,
    setErrors,
  });
  return { fields, setFields, validate, formItemProps, inputProps, dropdownProps };
}
