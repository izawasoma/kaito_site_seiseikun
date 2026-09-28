import { useId } from "react";
import styled from "styled-components";
import type { FieldDescription } from "@/components/ui/form/FormControl";
import {
  SelectionLabel,
  selectionStyles,
} from "@/components/ui/form/selectionStyles";

type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type RadioGroupProps = FieldDescription & {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly RadioOption[];
  disabled?: boolean;
};

export default function RadioGroup({
  name,
  label,
  value,
  onValueChange,
  options,
  required,
  disabled,
  helperText,
  error,
}: RadioGroupProps) {
  const id = useId();
  const groupName = name ?? id;
  const describedBy = [
    helperText ? `${id}-help` : undefined,
    error ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Group disabled={disabled}>
      <Legend>
        {required && <RequiredMark aria-hidden="true">※</RequiredMark>}
        {label}
      </Legend>

      {helperText && <Helper id={`${id}-help`}>{helperText}</Helper>}

      <Options>
        {options.map((option) => (
          <SelectionLabel key={option.value}>
            <Input
              type="radio"
              name={groupName}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onValueChange(event.target.value)}
              required={required}
              disabled={disabled || option.disabled}
              aria-describedby={describedBy || undefined}
              aria-invalid={error ? true : undefined}
            />
            <span>{option.label}</span>
          </SelectionLabel>
        ))}
      </Options>

      {error && (
        <ErrorText id={`${id}-error`} role="alert">
          {error}
        </ErrorText>
      )}
    </Group>
  );
}

const Group = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
`;

const Legend = styled.legend`
  margin-bottom: 4px;
  padding: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.red};
`;

const Options = styled.div`
  display: grid;
  gap: 4px;
`;

const Helper = styled.p`
  margin: 0 0 4px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 11px;
`;

const ErrorText = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.red};
  font-size: 11px;
`;

const Input = styled.input`
  ${selectionStyles}
  display: grid;
  place-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.white};

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.blue};
    visibility: hidden;
  }

  &:checked::before {
    visibility: visible;
  }
`;
