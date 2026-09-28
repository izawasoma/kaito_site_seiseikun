import { useState } from "react";
import ChoiceListEditor, {
  type ChoiceItem,
} from "@/components/editor/fields/ChoiceListEditor";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import Switch from "@/components/ui/form/Switch";

export default function ChoiceExamples() {
  const [disabled, setDisabled] = useState(false);

  const [singleChoices, setSingleChoices] = useState<ChoiceItem[]>([
    { id: "single-1", label: "りんご", correct: true },
    { id: "single-2", label: "みかん", correct: false },
    { id: "single-3", label: "ぶどう", correct: false },
  ]);

  const [multipleChoices, setMultipleChoices] = useState<ChoiceItem[]>([
    { id: "multiple-1", label: "りんご", correct: true },
    { id: "multiple-2", label: "みかん", correct: false },
    { id: "multiple-3", label: "ぶどう", correct: true },
  ]);

  return (
    <section>
      <SettingsPanelHeader title="単一解答欄" icon="format_list_bulleted" />

      <FormSection title="確認設定">
        <Switch
          label="確認用：編集を無効にする"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />
      </FormSection>

      <FormSection title="セレクトボックス設定">
        <ChoiceListEditor
          mode="single"
          value={singleChoices}
          onChange={setSingleChoices}
          disabled={disabled}
        />

        <p role="status">
          正解：{singleChoices.filter((choice) => choice.correct).length}件
        </p>
      </FormSection>

      <FormSection title="複数選択設定">
        <ChoiceListEditor
          mode="multiple"
          value={multipleChoices}
          onChange={setMultipleChoices}
          disabled={disabled}
        />

        <p role="status">
          正解：{multipleChoices.filter((choice) => choice.correct).length}件
        </p>
      </FormSection>
    </section>
  );
}
