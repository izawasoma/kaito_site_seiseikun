import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";
import AnswerCandidatesField from "@/components/editor/fields/AnswerCandidatesField";
import ChoiceListEditor from "@/components/editor/fields/ChoiceListEditor";
import type { AnswerFieldValue } from "@/types/project";

/** 回答形式に応じた候補を編集する。単一選択への切替時は正解を1つに絞る。 */
export default function AnswerFieldEditor({ value, onChange, showLabel = false }: {
  value: AnswerFieldValue; onChange: (value: AnswerFieldValue) => void; showLabel?: boolean;
}) {
  return <>
    <SelectField label="入力形式" value={value.type} options={[{ value: "text", label: "短文回答" }, { value: "single", label: "セレクトボックス" }, { value: "multiple", label: "複数選択" }]} onValueChange={(type) => {
      if (type !== "text" && type !== "single" && type !== "multiple") return;
      const firstCorrectId = value.choices.find((choice) => choice.correct)?.id;
      const choices = type === "single" ? value.choices.map((choice) => ({ ...choice, correct: choice.id === firstCorrectId })) : value.choices;
      onChange({ ...value, type, choices });
    }} />
    {showLabel && <DecoratedTextField label="解答欄ラベル" required value={value.label} onChange={(label) => onChange({ ...value, label })} />}
    {value.type !== "multiple" && <>
      <DecoratedTextField label="入力欄前の文章" helperText="空欄で非表示" value={value.beforeText} onChange={(beforeText) => onChange({ ...value, beforeText })} />
      <DecoratedTextField label="入力欄後ろの文章" helperText="空欄で非表示" value={value.afterText} onChange={(afterText) => onChange({ ...value, afterText })} />
    </>}
    {value.type === "text" ? <>
      <TextField label="プレースホルダー" value={value.placeholder} onChange={(event) => onChange({ ...value, placeholder: event.target.value })} />
      <AnswerCandidatesField value={value.candidates} onChange={(candidates) => onChange({ ...value, candidates })} />
    </> : <ChoiceListEditor mode={value.type} value={value.choices} onChange={(choices) => onChange({ ...value, choices })} />}
  </>;
}
