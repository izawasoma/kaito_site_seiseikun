import { useId, type ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";
import { fieldStyles } from "@/components/ui/form/fieldStyles";

type TextAreaFieldProps = FieldDescription &
  Omit<ComponentPropsWithoutRef<"textarea">, "children">;

export default function TextAreaField({
  id,
  label,
  required,
  helperText,
  error,
  rows = 5,
  "aria-describedby": externalDescription,
  "aria-invalid": externalInvalid,
  ...textareaProps
}: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const describedBy = [
    externalDescription,
    helperText ? `${inputId}-help` : undefined,
    error ? `${inputId}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FormControl
      id={inputId}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <TextArea
        {...textareaProps}
        id={inputId}
        rows={rows}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : externalInvalid}
      />
    </FormControl>
  );
}

const TextArea = styled.textarea`
  ${fieldStyles}
  line-height: 1.5;
  resize: vertical;
`;
