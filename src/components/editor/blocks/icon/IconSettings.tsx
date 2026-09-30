import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import ColorField from "@/components/ui/form/ColorField";
import Switch from "@/components/ui/form/Switch";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import IconPicker from "@/components/editor/fields/IconPicker";
import type { IconBlock } from "@/types/project";

/** アイコンカードの見出しと本文を、独立した文字設定で編集する。 */
export default function IconSettings({ value, onChange }: {
  value: IconBlock["settings"]; onChange: (value: IconBlock["settings"]) => void;
}) {
  return <>
    <SettingsPanelHeader title="アイコンカード" icon="dashboard" />
    <FormSection title="基本設定">
      <ColorField label="背景色" value={value.backgroundColor} onValueChange={(backgroundColor) => onChange({ ...value, backgroundColor })} />
      <ColorField label="文字色" value={value.textColor} onValueChange={(textColor) => onChange({ ...value, textColor })} />
      <Switch label="角丸にする" checked={value.rounded} onChange={(event) => onChange({ ...value, rounded: event.target.checked })} />
    </FormSection>
    <FormSection title="タイトル">
      <DecoratedTextField label="タイトル" required value={value.title} onChange={(title) => onChange({ ...value, title })} />
      <IconPicker required value={value.icon} onChange={(icon) => onChange({ ...value, icon })} />
    </FormSection>
    <FormSection title="タイトルスタイル設定"><TypographyFields value={value.titleTypography} onChange={(titleTypography) => onChange({ ...value, titleTypography })} /></FormSection>
    <FormSection title="内容"><DecoratedTextField label="テキスト" required multiline value={value.text} onChange={(text) => onChange({ ...value, text })} /></FormSection>
    <FormSection title="内容スタイル設定"><TypographyFields value={value.typography} onChange={(typography) => onChange({ ...value, typography })} /></FormSection>
  </>;
}
