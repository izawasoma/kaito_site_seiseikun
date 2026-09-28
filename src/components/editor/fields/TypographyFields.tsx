import styled, { useTheme } from "styled-components";
import SegmentedControl from "@/components/ui/form/SegmentedControl";
import SelectField from "@/components/ui/form/SelectField";
import NumberField from "@/components/ui/form/NumberField";
import type { AppTheme } from "@/styles/theme";

export type TypographyValue = {
  alignment: "left" | "center" | "right";
  fontFamily: string;
  fontWeight: keyof AppTheme["fontWeights"];
  fontSize: string;
};

type TypographyFieldsProps = {
  value: TypographyValue;
  onChange: (value: TypographyValue) => void;
  fontSizeError?: string;
  disabled?: boolean;
};

const alignmentOptions = [
  { value: "left", label: "左揃え", icon: "format_align_left" },
  { value: "center", label: "中央揃え", icon: "format_align_center" },
  { value: "right", label: "右揃え", icon: "format_align_right" },
];

const fontOptions = [
  { value: "inherit", label: "ページ設定を使用" },
  { value: "Noto Sans JP", label: "Noto Sans JP" },
];

const weightLabels: Record<TypographyValue["fontWeight"], string> = {
  thin: "Thin",
  extraLight: "Extra Light",
  light: "Light",
  regular: "Regular",
  medium: "Medium",
  semiBold: "Semi Bold",
  bold: "Bold",
  extraBold: "Extra Bold",
  black: "Black",
};

export default function TypographyFields({
  value,
  onChange,
  fontSizeError,
  disabled,
}: TypographyFieldsProps) {
  const theme = useTheme();

  const weightOptions = Object.keys(theme.fontWeights).map((key) => ({
    value: key,
    label: weightLabels[key as TypographyValue["fontWeight"]],
  }));

  return (
    <Fields>
      <SegmentedControl
        label="配置"
        value={value.alignment}
        onValueChange={(alignment) => {
          if (
            alignment === "left" ||
            alignment === "center" ||
            alignment === "right"
          ) {
            onChange({ ...value, alignment });
          }
        }}
        options={alignmentOptions}
        disabled={disabled}
      />

      <SelectField
        label="フォント"
        value={value.fontFamily}
        onValueChange={(fontFamily) => onChange({ ...value, fontFamily })}
        options={fontOptions}
        disabled={disabled}
      />

      <SelectField
        label="太さ"
        value={value.fontWeight}
        onValueChange={(fontWeight) => {
          if (Object.hasOwn(theme.fontWeights, fontWeight)) {
            onChange({
              ...value,
              fontWeight: fontWeight as TypographyValue["fontWeight"],
            });
          }
        }}
        options={weightOptions}
        disabled={disabled}
      />

      <NumberField
        label="文字サイズ"
        unit="px"
        min={1}
        step="any"
        value={value.fontSize}
        onChange={(event) =>
          onChange({ ...value, fontSize: event.target.value })
        }
        error={fontSizeError}
        disabled={disabled}
      />
    </Fields>
  );
}

const Fields = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;
