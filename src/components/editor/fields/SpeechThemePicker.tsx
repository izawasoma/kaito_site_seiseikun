import { useId } from "react";
import styled from "styled-components";
import SpeechThemePreview, {
  type SpeechTheme,
} from "@/components/editor/speech/SpeechThemePreview";
import { selectionStyles } from "@/components/ui/form/selectionStyles";

type SpeechThemePickerProps = {
  value: SpeechTheme;
  onChange: (value: SpeechTheme) => void;
  disabled?: boolean;
};

const options = [
  { value: "rpg", label: "RPG風のウィンドウ" },
  { value: "normal", label: "通常の吹出しウィンドウ" },
  { value: "rounded", label: "角丸の吹出しウィンドウ" },
] as const;

export default function SpeechThemePicker({
  value,
  onChange,
  disabled = false,
}: SpeechThemePickerProps) {
  const name = useId();

  return (
    <Group disabled={disabled}>
      <Legend>吹出しデザイン</Legend>

      <Options>
        {options.map((option) => (
          <Option key={option.value}>
            <LabelRow>
              <Radio
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={disabled}
              />
              <span>{option.label}</span>
            </LabelRow>

            <SpeechThemePreview value={option.value} />
          </Option>
        ))}
      </Options>
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

const Options = styled.div`
  display: grid;
  gap: 4px;
`;

const Option = styled.label`
  display: grid;
  gap: 2px;
  min-width: 0;
  cursor: pointer;

  &:hover:not(:has(input:disabled)) {
    outline: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }

  &:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LabelRow = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 11px;
  line-height: 1.5;
`;

const Radio = styled.input`
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

  &:focus-visible {
    outline: none;
  }
`;
