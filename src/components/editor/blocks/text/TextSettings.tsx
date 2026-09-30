import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import type { TextSettingsValue } from "@/types/project";
import FormSection from "@/components/ui/form/FormSection";
import Checkbox from "@/components/ui/form/Checkbox";
import RadioGroup from "@/components/ui/form/RadioGroup";
import Switch from "@/components/ui/form/Switch";

type TextSettingsProps = {
  value: TextSettingsValue;
  onChange: (value: TextSettingsValue) => void;
  rpgTypewriterEnabled: boolean;
  textError?: string;
  fontSizeError?: string;
  showSimultaneous: boolean;
  simultaneous: boolean;
  onSimultaneousChange: (simultaneous: boolean) => void;
};

/** 通常テキストの本文・装飾・文字設定を編集する。 */
export default function TextSettings({
  value,
  onChange,
  rpgTypewriterEnabled,
  textError,
  fontSizeError,
  showSimultaneous,
  simultaneous,
  onSimultaneousChange,
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
        <RadioGroup
          label="デザイン"
          value={value.textTheme}
          options={[{ value: "normal", label: "通常" }, { value: "rpg", label: "RPG" }]}
          onValueChange={(textTheme) => {
            if (textTheme === "normal" || textTheme === "rpg") onChange({ ...value, textTheme });
          }}
        />
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
