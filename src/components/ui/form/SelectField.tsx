import { useId, type CSSProperties, type ComponentPropsWithoutRef } from "react";
import * as Select from "@radix-ui/react-select";
import styled from "styled-components";
import FormControl, {
  type FieldDescription,
} from "@/components/ui/form/FormControl";
import { fieldStyles } from "@/components/ui/form/fieldStyles";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  style?: CSSProperties;
};

type SelectFieldProps = FieldDescription & {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options: readonly SelectOption[];
  "aria-describedby"?: string;
  "aria-invalid"?: ComponentPropsWithoutRef<"button">["aria-invalid"];
};

export default function SelectField({
  id,
  name,
  label,
  required,
  helperText,
  error,
  value,
  defaultValue,
  onValueChange,
  disabled,
  placeholder = "選択してください",
  options,
  "aria-describedby": externalDescription,
  "aria-invalid": externalInvalid,
}: SelectFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const describedBy = [
    externalDescription,
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
      <Select.Root
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <Trigger
          id={inputId}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : externalInvalid}
        >
          <SelectedText>
            <Select.Value placeholder={placeholder} />
          </SelectedText>

          <Select.Icon asChild>
            <span className="material-icons" aria-hidden="true">
              expand_more
            </span>
          </Select.Icon>
        </Trigger>

        <Select.Portal>
          <Content
            position="popper"
            side="bottom"
            align="start"
            sideOffset={0}
            collisionPadding={8}
          >
            <ScrollUp>
              <span className="material-icons" aria-hidden="true">
                expand_less
              </span>
            </ScrollUp>

            <Select.Viewport>
              {options.map((option) => (
                <Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <Select.ItemText><span style={option.style}>{option.label}</span></Select.ItemText>
                </Item>
              ))}
            </Select.Viewport>

            <ScrollDown>
              <span className="material-icons" aria-hidden="true">
                expand_more
              </span>
            </ScrollDown>
          </Content>
        </Select.Portal>
      </Select.Root>
    </FormControl>
  );
}

const Trigger = styled(Select.Trigger)`
  ${fieldStyles}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 37px;
  color: ${({ theme }) => theme.colors.deepGray};
  text-align: left;
  cursor: pointer;

  .material-icons {
    flex-shrink: 0;
    font-size: 20px;
  }

  &[data-placeholder] {
    color: ${({ theme }) => theme.colors.gray};
  }
`;

const SelectedText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Content = styled(Select.Content)`
  /* Portalでbody直下に表示されるため、モーダル本体（201）より手前に配置する。 */
  z-index: 202;
  width: var(--radix-select-trigger-width);
  max-height: min(280px, var(--radix-select-content-available-height));
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGray};
  box-shadow: 0 2px 3px ${({ theme }) => `${theme.colors.black}33`};
`;

const Item = styled(Select.Item)`
  display: flex;
  align-items: center;
  min-height: 37px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: 1.5;
  cursor: pointer;
  user-select: none;

  &[data-highlighted] {
    outline: none;
    background-color: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.deepGray};
  }

  &[data-disabled] {
    color: ${({ theme }) => theme.colors.gray};
    pointer-events: none;
  }
`;

const ScrollUp = styled(Select.ScrollUpButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ScrollDown = styled(Select.ScrollDownButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.white};
`;
