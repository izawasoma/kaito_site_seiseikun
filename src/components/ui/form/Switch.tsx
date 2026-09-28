import type { ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import {
  SelectionLabel,
  selectionStyles,
} from "@/components/ui/form/selectionStyles";

type SwitchProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "children" | "role"
> & {
  label: string;
};

export default function Switch({ label, ...props }: SwitchProps) {
  return (
    <SelectionLabel>
      <Input {...props} type="checkbox" role="switch" />
      <span>{label}</span>
    </SelectionLabel>
  );
}

const Input = styled.input`
  ${selectionStyles}
  display: flex;
  align-items: center;
  width: 40px;
  height: 20px;
  padding: 1px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.lightGray};

  &::before {
    content: "";
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.white};
  }

  &:checked {
    border-color: ${({ theme }) => theme.colors.blue};
    background-color: ${({ theme }) => theme.colors.blue};
  }

  &:checked::before {
    transform: translateX(20px);
  }
`;
