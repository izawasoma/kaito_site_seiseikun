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
      {language === "css" && <small>このブロック内に適用します。ブロック全体の指定は :scope を使用してください。外部CSSの読み込み・@font-face・@keyframesなどの全体定義には対応していません。</small>}
      {language === "javascript" && <small>HTML配置後にページ上で実行します。他のブロックも操作できます。</small>}
      <CodeEditor language={language} value={value[language]} onChange={(code) => onChange({ ...value, [language]: code })} />
    </FormSection>)}
  </>;
}
