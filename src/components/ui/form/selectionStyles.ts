import styled, { css } from "styled-components";

export const SelectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
  line-height: 1.5;
  cursor: pointer;

  &:has(input:disabled) {
    color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;

export const selectionStyles = css`
  appearance: none;
  flex-shrink: 0;
  margin: 0;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
