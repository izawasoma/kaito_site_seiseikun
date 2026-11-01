import NumberField from "@/components/ui/form/NumberField";
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
    <NumberField label="判定待ち時間" unit="ms" min={0} max={60000} step={1}
      value={String(value.judgmentDelayMs ?? 200)}
      onChange={(event) => onChange({ ...value, judgmentDelayMs: Number(event.target.value) })}
      helperText="1000msで1秒です。送信から判定結果を表示するまでの時間を設定します。0msで待ち時間なしになります。"
      error={value.judgmentDelayMs === undefined || (Number.isInteger(value.judgmentDelayMs) && value.judgmentDelayMs >= 0 && value.judgmentDelayMs <= 60000) ? undefined : "0〜60000の整数を入力してください"}
    />
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
