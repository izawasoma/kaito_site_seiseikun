import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields, {
  type TypographyValue,
} from "@/components/editor/fields/TypographyFields";
import FormSection from "@/components/ui/form/FormSection";
import Switch from "@/components/ui/form/Switch";

export type TitleSettingsValue = {
  text: string;
  typography: TypographyValue;
  typewriter: boolean;
};

type TitleSettingsProps = {
  value: TitleSettingsValue;
  onChange: (value: TitleSettingsValue) => void;
  rpgTypewriterEnabled: boolean;
  textError?: string;
  fontSizeError?: string;
};

export default function TitleSettings({
  value,
  onChange,
  rpgTypewriterEnabled,
  textError,
  fontSizeError,
}: TitleSettingsProps) {
  return (
    <div>
      <SettingsPanelHeader title="タイトル" icon="title" />

      <FormSection title="内容">
        <DecoratedTextField
          label="タイトル"
          required
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
