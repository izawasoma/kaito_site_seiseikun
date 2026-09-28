import { useState } from "react";
import ActionFields, {
  type ActionValue,
} from "@/components/editor/fields/ActionFields";
import AnswerCandidatesField from "@/components/editor/fields/AnswerCandidatesField";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";

export default function AnswerExamples() {
  const [action, setAction] = useState<ActionValue>({
    type: "next",
    url: "",
  });
  const [candidates, setCandidates] = useState<string[]>([
    "いちごいちえ",
    "一期一会",
  ]);

  return (
    <section>
      <SettingsPanelHeader title="単一解答欄" icon="format_list_bulleted" />

      <FormSection title="基本設定">
        <ActionFields value={action} onChange={setAction} />
      </FormSection>

      <FormSection title="短文回答設定">
        <AnswerCandidatesField value={candidates} onChange={setCandidates} />
      </FormSection>
    </section>
  );
}
