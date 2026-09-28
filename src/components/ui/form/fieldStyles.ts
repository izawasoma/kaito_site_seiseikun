import { css } from "styled-components";

export const fieldStyles = css`
  display: block;
  width: 100%;
  min-width: 0;
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
