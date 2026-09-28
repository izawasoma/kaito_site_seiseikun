import { useId } from "react";
import styled from "styled-components";
import Icon from "@/components/ui/icon/Icon";

type SegmentOption = {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
};

type SegmentedControlProps = {
  label: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SegmentOption[];
  disabled?: boolean;
};

export default function SegmentedControl({
  label,
  name,
  value,
  onValueChange,
  options,
  disabled,
}: SegmentedControlProps) {
  const id = useId();

  return (
    <Group disabled={disabled}>
      <Legend>{label}</Legend>

      <Segments>
        {options.map((option) => (
          <Segment key={option.value} title={option.label}>
            <HiddenRadio
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onValueChange(event.target.value)}
              disabled={disabled || option.disabled}
              aria-label={option.label}
            />

            <SegmentFace aria-hidden="true">
              {option.icon ? <Icon name={option.icon} /> : option.label}
            </SegmentFace>
          </Segment>
        ))}
      </Segments>
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

const Segments = styled.div`
  display: flex;
`;

const Segment = styled.label`
  position: relative;
  flex: 1;
  min-width: 0;

  & + & {
    margin-left: -1px;
  }

  &:focus-within {
    z-index: 1;
  }
`;

const HiddenRadio = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

const SegmentFace = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
  cursor: pointer;

  input:not(:disabled):not(:checked) + &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  input:checked + & {
    border-color: ${({ theme }) => theme.colors.deepBlue};
    background-color: ${({ theme }) => theme.colors.deepBlue};
    color: ${({ theme }) => theme.colors.white};
  }

  input:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: -3px;
    box-shadow: inset 0 0 0 3px ${({ theme }) => theme.colors.white};
  }

  input:disabled + & {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
