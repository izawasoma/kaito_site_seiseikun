import RadioGroup from "@/components/ui/form/RadioGroup";
import DecoratedTextField from "@/components/editor/fields/DecoratedTextField";
import ActionFields from "@/components/editor/fields/ActionFields";
import TypographyFields from "@/components/editor/fields/TypographyFields";
import type { AnswerCommonSettings } from "@/types/project";
import { getLinkUrl } from "@/lib/getLinkUrl";

/** 単一回答・多答回答で共通の表示と判定後の挙動を編集する。 */
export default function AnswerCommonFields({ value, onChange }: {
  value: AnswerCommonSettings; onChange: (value: AnswerCommonSettings) => void;
}) {
  return <>
    <DecoratedTextField label="入力注意事項" helperText="空欄で非表示" value={value.instruction} onChange={(instruction) => onChange({ ...value, instruction })} />
    <DecoratedTextField label="送信ボタンラベル" required value={value.submitLabel} onChange={(submitLabel) => onChange({ ...value, submitLabel })} />
    <DecoratedTextField label="正解時メッセージ" helperText="空欄で非表示" value={value.successMessage} onChange={(successMessage) => onChange({ ...value, successMessage })} />
    <DecoratedTextField label="不正解時メッセージ" required value={value.errorMessage} onChange={(errorMessage) => onChange({ ...value, errorMessage })} />
    <RadioGroup label="不正解時アニメーション" value={value.animation} options={[{ value: "shake", label: "横揺れ" }, { value: "none", label: "なし" }]} onValueChange={(animation) => { if (animation === "shake" || animation === "none") onChange({ ...value, animation }); }} />
    <ActionFields value={value.action} onChange={(action) => onChange({ ...value, action })} urlError={value.action.type === "link" && !getLinkUrl(value.action.url) ? "有効な遷移先URLを入力してください" : undefined} />
    {value.action.type === "link" && value.action.allowRepeat && <DecoratedTextField label="正解後のラベル" required value={value.successLabel} onChange={(successLabel) => onChange({ ...value, successLabel })} />}
    <TypographyFields value={value.typography} onChange={(typography) => onChange({ ...value, typography })} />
  </>;
}
