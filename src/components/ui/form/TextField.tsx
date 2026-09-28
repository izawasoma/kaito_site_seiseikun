import { useId, type ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";

type TextFieldProps = FieldDescription &
  Omit<ComponentPropsWithoutRef<"input">, "children" | "type"> & {
    type?: "text" | "url" | "email" | "password" | "search" | "tel";
  };

export default function TextField({
  id,
  label,
  required,
  helperText,
  error,
  type = "text",
  "aria-describedby": externalDescription,
  "aria-invalid": externalInvalid,
  ...inputProps
}: TextFieldProps) {
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
      <Input
        {...inputProps}
        id={inputId}
        type={type}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : externalInvalid}
      />
    </FormControl>
  );
}

const Input = styled.input`
  display: block;
  width: 100%;
  min-width: 0;
  height: 37px;
  padding: 6px 10px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;
