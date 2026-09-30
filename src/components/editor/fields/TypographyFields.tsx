import { fontFamilyStyle } from "@/lib/fonts/japaneseFonts";
import { availableFontWeights, supportedFontWeight, weightLabels } from "@/lib/fonts/fontWeights";
import { useContext } from "react";
import { PageFontContext } from "./FontContext";
import FontSelectField from "./FontSelectField";
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

export default function TypographyFields({
  value,
  onChange,
  fontSizeError,
  disabled,
}: TypographyFieldsProps) {
  const theme = useTheme();

  const pageFont = useContext(PageFontContext);
  const effectiveFamily = value.fontFamily === "inherit" ? pageFont : value.fontFamily;
  const supportedWeight = supportedFontWeight(effectiveFamily, value.fontWeight);
  const weightOptions = availableFontWeights(effectiveFamily).map((key) => ({
    value: key,
    style: { fontFamily: fontFamilyStyle(effectiveFamily), fontWeight: theme.fontWeights[key] },
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

      <FontSelectField value={value.fontFamily} allowInherit disabled={disabled}
        onChange={(fontFamily) => onChange({ ...value, fontFamily, fontWeight: supportedFontWeight(fontFamily === "inherit" ? pageFont : fontFamily, value.fontWeight) })} />

      <SelectField
        label="太さ"
        value={supportedWeight}
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
