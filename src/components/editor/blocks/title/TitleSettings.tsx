import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import type { TitleSettingsValue } from "@/types/project";
import FormSection from "@/components/ui/form/FormSection";
import Checkbox from "@/components/ui/form/Checkbox";
import Switch from "@/components/ui/form/Switch";

type TitleSettingsProps = {
  value: TitleSettingsValue;
  onChange: (value: TitleSettingsValue) => void;
  rpgTypewriterEnabled: boolean;
  textError?: string;
  fontSizeError?: string;
  showSimultaneous: boolean;
  simultaneous: boolean;
  onSimultaneousChange: (simultaneous: boolean) => void;
};

export default function TitleSettings({
  value,
  onChange,
  rpgTypewriterEnabled,
  textError,
  fontSizeError,
  showSimultaneous,
  simultaneous,
  onSimultaneousChange,
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

        {showSimultaneous && (
          <Checkbox
            label="前の出現と同時に表示"
            checked={simultaneous}
            onChange={(event) => onSimultaneousChange(event.target.checked)}
          />
        )}

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
