import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import ColorField from "@/components/ui/form/ColorField";
import ActionFields from "@/components/editor/fields/ActionFields";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import type { ButtonBlock } from "@/types/project";
import { getLinkUrl } from "@/lib/getLinkUrl";

/** 進行ボタンとリンクボタンの共通設定。 */
export default function ButtonSettings({ value, onChange }: {
  value: ButtonBlock["settings"]; onChange: (value: ButtonBlock["settings"]) => void;
}) {
  return <>
    <SettingsPanelHeader title="ボタン" icon="ads_click" />
    <FormSection title="基本設定"><ActionFields label="押下時の挙動" value={value.action} onChange={(action) => onChange({ ...value, action })} urlError={value.action.type === "link" && !getLinkUrl(value.action.url) ? "有効な遷移先URLを入力してください" : undefined} /></FormSection>
    <FormSection title="表示設定">
      <ColorField label="背景色" value={value.backgroundColor} onValueChange={(backgroundColor) => onChange({ ...value, backgroundColor })} />
      <ColorField label="文字色" value={value.textColor} onValueChange={(textColor) => onChange({ ...value, textColor })} />
      <DecoratedTextField label="ラベル" required value={value.text} onChange={(text) => onChange({ ...value, text })} />
      <TypographyFields value={value.typography} onChange={(typography) => onChange({ ...value, typography })} />
    </FormSection>
  </>;
}
