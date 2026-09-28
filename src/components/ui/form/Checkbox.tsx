import type { ComponentPropsWithoutRef } from "react";
import styled from "styled-components";
import {
  SelectionLabel,
  selectionStyles,
} from "@/components/ui/form/selectionStyles";

type CheckboxProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "children"
> & {
  label: string;
};

export default function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <SelectionLabel>
      <Input {...props} type="checkbox" />
      <span>{label}</span>
    </SelectionLabel>
  );
}

const Input = styled.input`
  ${selectionStyles}
  display: grid;
  place-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 0;
  background-color: ${({ theme }) => theme.colors.white};

  &::before {
    content: "";
    width: 12px;
    height: 7px;
    border-left: 2px solid ${({ theme }) => theme.colors.deepBlue};
    border-bottom: 2px solid ${({ theme }) => theme.colors.deepBlue};
    transform: translateY(-2px) rotate(-45deg);
    visibility: hidden;
  }

  &:checked::before {
    visibility: visible;
  }
`;
