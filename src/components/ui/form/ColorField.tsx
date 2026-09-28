import { useId } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import * as Popover from "@radix-ui/react-popover";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";
import Icon from "@/components/ui/icon/Icon";

type ColorFieldProps = FieldDescription & {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export default function ColorField({
  id,
  name,
  label,
  value,
  onValueChange,
  required,
  disabled,
  helperText,
  error,
}: ColorFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const describedBy = [
    helperText ? `${inputId}-help` : undefined,
    error ? `${inputId}-error` : undefined,
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
      <Popover.Root>
        <InputRow>
          <Popover.Trigger asChild>
            <SwatchButton
              type="button"
              disabled={disabled}
              aria-label={`${label}のカラーピッカーを開く`}
            >
              <Swatch style={{ backgroundColor: value }} />
            </SwatchButton>
          </Popover.Trigger>

          <CodeInput
            id={inputId}
            name={name}
            color={value}
            onChange={onValueChange}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </InputRow>

        <Popover.Portal>
          <PickerPanel
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={8}
            aria-label={`${label}の色選択`}
          >
            <PickerHeader>
              <span>{label}</span>
              <Popover.Close asChild>
                <CloseButton type="button" aria-label="色選択を閉じる">
                  <Icon name="close" size={20} />
                </CloseButton>
              </Popover.Close>
            </PickerHeader>

            <HexColorPicker color={value} onChange={onValueChange} />
          </PickerPanel>
        </Popover.Portal>
      </Popover.Root>
    </FormControl>
  );
}

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 37px;
  padding: 4px 7px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};

  &:has(input:disabled) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
`;

const SwatchButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Swatch = styled.span`
  display: block;
  width: 100%;
  height: 100%;
`;

const CodeInput = styled(HexColorInput)`
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 27px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 14px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;

const PickerPanel = styled(Popover.Content)`
  z-index: 100;
  width: 226px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 6px ${({ theme }) => `${theme.colors.black}33`};

  .react-colorful {
    width: 200px;
    height: 180px;
  }
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.deepGray};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 2px;
  }
`;
