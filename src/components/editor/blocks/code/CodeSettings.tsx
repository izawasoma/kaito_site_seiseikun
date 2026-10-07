import CodeEditor from "./CodeEditor";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import type { CodeBlock } from "@/types/project";

/** HTML・CSS・JavaScriptを独立した補完付き入力欄で編集する。 */
export default function CodeSettings({ value, onChange }: {
  value: CodeBlock["settings"]; onChange: (value: CodeBlock["settings"]) => void;
}) {
  return <><SettingsPanelHeader title="HTMLコード" icon="code" />
    {(["html", "css", "javascript"] as const).map((language) => <FormSection key={language} title={language === "javascript" ? "JavaScript" : language.toUpperCase()}>
      <span>コードを記入</span>
      <CodeEditor language={language} value={value[language]} onChange={(code) => onChange({ ...value, [language]: code })} />
    </FormSection>)}
  </>;
}
