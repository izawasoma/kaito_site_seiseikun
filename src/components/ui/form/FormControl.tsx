import type { ReactNode } from "react";
import styled from "styled-components";

export type FieldDescription = {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
};

type FormControlProps = FieldDescription & {
  id: string;
  children: ReactNode;
};

export default function FormControl({
  id,
  label,
  required,
  helperText,
  error,
  children,
}: FormControlProps) {
  return (
    <Container>
      <Label htmlFor={id}>
        {required && <RequiredMark aria-hidden="true">※</RequiredMark>}
        {label}
      </Label>

      {helperText && <Helper id={`${id}-help`}>{helperText}</Helper>}

      {children}

      {error && (
        <ErrorText id={`${id}-error`} role="alert">
          {error}
        </ErrorText>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.red};
`;

const Helper = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 11px;
  line-height: 1.5;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.red};
  font-size: 11px;
  line-height: 1.5;
`;
