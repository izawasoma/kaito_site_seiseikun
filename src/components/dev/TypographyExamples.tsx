import { useState } from "react";
import styled, { useTheme } from "styled-components";
import TypographyFields, {
  type TypographyValue,
} from "@/components/editor/fields/TypographyFields";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";

export default function TypographyExamples() {
  const theme = useTheme();

  const [value, setValue] = useState<TypographyValue>({
    alignment: "left",
    fontFamily: "inherit",
    fontWeight: "medium",
    fontSize: "24",
  });

  const size = Number(value.fontSize);
  const validSize =
    value.fontSize.trim() !== "" && Number.isFinite(size) && size >= 1;

  return (
    <section>
      <SettingsPanelHeader title="タイトル" icon="title" />

      <FormSection title="基本設定">
        <TypographyFields
          value={value}
          onChange={setValue}
          fontSizeError={
            validSize ? undefined : "1以上の数値を入力してください"
          }
        />
      </FormSection>

      <Preview
        style={{
          textAlign: value.alignment,
          fontFamily:
            value.fontFamily === "inherit"
              ? "inherit"
              : `"${value.fontFamily}", sans-serif`,
          fontWeight: theme.fontWeights[value.fontWeight],
          fontSize: validSize ? `${size}px` : "24px",
        }}
      >
        冒険のはじまり
      </Preview>
    </section>
  );
}

const Preview = styled.p`
  margin: 0;
  padding: 20px;
  overflow-wrap: anywhere;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
`;
