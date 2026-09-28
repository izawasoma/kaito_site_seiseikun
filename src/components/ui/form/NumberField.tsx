import { useId, type ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";
import { fieldStyles } from "@/components/ui/form/fieldStyles";

type NumberFieldProps = FieldDescription &
  Omit<ComponentPropsWithoutRef<"input">, "children" | "type"> & {
    unit?: string;
  };

export default function NumberField({
  id,
  label,
  required,
  helperText,
  error,
  unit,
  "aria-describedby": externalDescription,
  "aria-invalid": externalInvalid,
  ...inputProps
}: NumberFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const describedBy = [
    externalDescription,
    helperText ? `${inputId}-help` : undefined,
    error ? `${inputId}-error` : undefined,
    unit ? `${inputId}-unit` : undefined,
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
      <InputRow>
        <Input
          {...inputProps}
          id={inputId}
          type="number"
          required={required}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : externalInvalid}
        />
        {unit && <Unit id={`${inputId}-unit`}>{unit}</Unit>}
      </InputRow>
    </FormControl>
  );
}

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Input = styled.input`
  ${fieldStyles}
  flex: 1;
  height: 37px;
`;

const Unit = styled.span`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 14px;
`;
