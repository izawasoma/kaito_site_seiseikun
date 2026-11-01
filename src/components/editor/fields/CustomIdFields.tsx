import { useState } from "react";
import FormSection from "@/components/ui/form/FormSection";
import Checkbox from "@/components/ui/form/Checkbox";
import TextField from "@/components/ui/form/TextField";
import styled from "styled-components";
import { decoratedPlainText } from "@/lib/export/countDecoratedCharacters";
import { elementIds, customIdError, type IdBlock } from "@/lib/export/elementIds";
import type { CustomIdSettings } from "@/types/project";

export default function CustomIdFields({ block, onChange }: {
  block: IdBlock; onChange: (settings: CustomIdSettings) => void;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopyStatus(`「${id}」をコピーしました。`);
    } catch {
      setCopyStatus("コピーできませんでした。IDの文字列を選択してコピーしてください。");
    }
  }
  const enabled = block.settings.customIdEnabled === true;
  const error = customIdError(block);
  const ids = elementIds(block);
  const targets = [{ label: block.type === "button" ? "ボタン" : "回答フォーム全体", id: ids.root }];
  if (block.type !== "button") {
    const fields = block.type === "answer" ? [block.settings.answer] : block.settings.answers;
    fields.forEach((field, index) => {
      const fieldName = `${block.type === "answer" ? "回答欄" : `回答欄${index + 1}`}${field.label ? `「${decoratedPlainText(field.label)}」` : ""}`;
      if (field.type === "multiple") {
        field.choices.forEach((choice, choiceIndex) => targets.push({
          label: `${fieldName} ／ 選択肢${choiceIndex + 1}${choice.label ? `「${decoratedPlainText(choice.label)}」` : ""}（チェックボックス）`,
          id: ids.fields[index][choiceIndex],
        }));
      } else targets.push({
        label: `${fieldName}（${field.type === "text" ? "短文入力" : "セレクトボックス"}）`,
        id: ids.fields[index][0],
      });
    });
    targets.push({ label: "送信ボタン", id: ids.submit });
    if (block.settings.showClearButton) targets.push({ label: "削除ボタン", id: ids.clear });
  }
  return <FormSection title="上級者向け">
    <Checkbox label="独自のIDを設定する" checked={enabled} onChange={(event) => onChange({ customIdEnabled: event.target.checked })} />
    {enabled && <TextField label="独自ID" value={block.settings.customId ?? ""} placeholder="custom-id" error={error} helperText="同じページ内で重複しないIDを指定してください。" onChange={(event) => onChange({ customId: event.target.value })} />}
    {!error && <div>
      <div style={{ fontSize: 12 }}>出力されるIDと対象要素（IDをクリックでコピー）</div>
      <TargetList>{targets.map(({ label, id }) => <Target key={id}>
        <dt>{label}</dt>
        <dd><CopyButton type="button" onClick={() => copyId(id)} aria-label={`${label}のID「${id}」をコピー`} title="クリックでIDをコピー"><code>{id}</code><span aria-hidden="true">コピー</span></CopyButton></dd>
      </Target>)}</TargetList>
      <div role="status" style={{ fontSize: 12, overflowWrap: "anywhere" }}>{copyStatus}</div>
    </div>}
    {block.type !== "button" && <p style={{ fontSize: 12 }}>回答欄の追加・削除・並べ替え・入力形式の変更により、自動採番されるIDが変わります。変更後は独自コードの参照先も確認してください。</p>}
  </FormSection>;
}

const TargetList = styled.dl`
  margin: 8px 0 0;
  font-size: 12px;
  overflow-wrap: anywhere;
`;
const Target = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  dt { margin: 0 0 4px; font-weight: 600; }
  dd { margin: 0; }
  code { user-select: all; }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 4px 6px;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  code { min-width: 0; overflow-wrap: anywhere; }
  span { flex-shrink: 0; font-size: 11px; }
  &:hover { background: ${({ theme }) => theme.colors.veryLightGray}; }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.blue}; outline-offset: 2px; }
`;
