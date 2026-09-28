import type { ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type IconButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "aria-label"
> & {
  icon: string;
  label: string;
};

export default function IconButton({
  icon,
  label,
  type = "button",
  title,
  ...props
}: IconButtonProps) {
  return (
    <Button {...props} type={type} aria-label={label} title={title ?? label}>
      <Icon name={icon} />
    </Button>
  );
}

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 4px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.gray};
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
