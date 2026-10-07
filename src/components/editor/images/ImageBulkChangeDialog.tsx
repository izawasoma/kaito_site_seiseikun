import { useState, type ReactElement } from "react";
import styled from "styled-components";
import Dialog from "@/components/ui/dialog/Dialog";
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";
import Button from "@/components/ui/button/Button";
import { loadCharacters } from "@/lib/characterStorage";
import { collectImageUrls } from "@/lib/project/replaceImageUrls";
import { getImageUrl } from "@/lib/getImageUrl";
import type { ProjectData } from "@/types/project";

/** ページ内と登録済みキャラクターの画像URLを選び、一括変更する。 */
export default function ImageBulkChangeDialog({ project, trigger, onReplace }: {
  project: ProjectData;
  trigger: ReactElement;
  onReplace: (before: string, after: string) => void;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const afterError = submitted ? (!after.trim() ? "変更後URLは必須項目です" : !getImageUrl(after) ? "httpまたはhttpsの画像URLを入力してください" : before === after.trim() ? "変更前と異なるURLを入力してください" : undefined) : undefined;

  /** 開くたびにストレージを読み直し、読み込み失敗時は変更操作を止める。 */
  function handleOpenChange(open: boolean) {
    if (!open) return;
    setBefore(""); setAfter(""); setSubmitted(false); setError(""); setMessage(""); setUrls([]);
    try { setUrls(collectImageUrls(project, loadCharacters())); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "画像一覧を読み込めませんでした。"); }
  }

  /** 保存失敗時は入力を残し、成功後は更新したURLを引き続き選択できるようにする。 */
  function handleReplace() {
    setSubmitted(true); setMessage("");
    if (!before || !getImageUrl(after) || before === after.trim()) return;
    try {
      onReplace(before, after.trim());
      setUrls((currentUrls) => [...new Set(currentUrls.map((url) => url === before ? after.trim() : url))]);
      setBefore(""); setAfter(""); setSubmitted(false); setError("");
      setMessage("画像URLを一括変更しました。");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "画像URLを変更できませんでした。"); }
  }

  return <Dialog triggerLabel="画像の一括変更" trigger={trigger} title="画像URL一括変更"
    description="ページ内で使用している画像URLとストレージに登録しているキャラクター画像のURLを一括変更します。変更前URLを選択し、変更後のURLを入力してください。"
    onOpenChange={handleOpenChange} closeButtonGap={6}>
    <Fields>
      <SelectField label="変更前URL" value={before} options={urls.map((url) => ({ value: url, label: url }))}
        helperText={`画像URL：${urls.length}件（同じURLは1件に集約）`}
        onValueChange={setBefore} disabled={urls.length === 0} error={submitted && !before ? "変更前URLを選択してください" : undefined} />
      <TextField label="変更後URL" type="url" required value={after} onChange={(event) => setAfter(event.target.value)} error={afterError} />
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {!error && urls.length === 0 && <p>変更できる画像URLがありません。</p>}
      {message && <p role="status">{message}</p>}
    </Fields>
    <ReplaceButton onClick={handleReplace} disabled={urls.length === 0}>一括変更</ReplaceButton>
  </Dialog>;
}
const Fields = styled.div`display: grid; gap: 8px; min-width: 0;`;
const ReplaceButton = styled(Button)`width: 100%; background-color: ${({ theme }) => theme.colors.purple};`;
const ErrorMessage = styled.p`margin: 0; color: ${({ theme }) => theme.colors.red};`;
