import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import type { TextSettingsValue } from "@/types/project";
import FormSection from "@/components/ui/form/FormSection";
import Switch from "@/components/ui/form/Switch";

type TextSettingsProps = {
  value: TextSettingsValue;
  onChange: (value: TextSettingsValue) => void;
  rpgTypewriterEnabled: boolean;
  textError?: string;
  fontSizeError?: string;
};

/** 通常テキストの本文・装飾・文字設定を編集する。 */
export default function TextSettings({
  value,
  onChange,
  rpgTypewriterEnabled,
  textError,
  fontSizeError,
}: TextSettingsProps) {
  return (
    <div>
      <SettingsPanelHeader title="テキスト" icon="text_fields" />

      <FormSection title="内容">
        <DecoratedTextField
          label="テキスト"
          required
          multiline
          value={value.text}
          onChange={(text) => onChange({ ...value, text })}
          error={textError}
        />
      </FormSection>

      <FormSection title="基本設定">
        <TypographyFields
          value={value.typography}
          onChange={(typography) => onChange({ ...value, typography })}
          fontSizeError={fontSizeError}
        />

        {rpgTypewriterEnabled && (
          <Switch
            label="文字送りを有効にする"
            checked={value.typewriter}
            onChange={(event) =>
              onChange({
                ...value,
                typewriter: event.target.checked,
              })
            }
          />
        )}
      </FormSection>
    </div>
  );
}
