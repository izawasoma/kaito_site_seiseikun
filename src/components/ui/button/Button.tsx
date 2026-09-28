import type { ComponentPropsWithoutRef } from "react";
import styled from "styled-components";

type ButtonProps = ComponentPropsWithoutRef<"button">;

export default function Button({
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <StyledButton {...props} type={type}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 16px;
  border: none;
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.deepGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;
