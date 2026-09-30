import { useRef, useState, type ChangeEvent } from "react";
import type { ProjectData } from "@/types/project";
import { parseProject, parseProjectJson } from "@/lib/project/parseProject";

/** JSONダウンロードとファイル読み込みを担当し、検証が成功した場合だけ置き換えを通知する。 */
export default function useProjectFiles(
  project: ProjectData,
  onImport: (project: ProjectData) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importSequence = useRef(0);
  const lastFileName = useRef("kaito-project.json");
  const [notice, setNotice] = useState({ message: "", isError: false });

  /** 保存名を確認し、使用キャラクターも含むプロジェクト全体をUTF-8のJSONとして保存する。 */
  function downloadProject() {
    const enteredName = window.prompt("保存するファイル名を入力してください。", lastFileName.current);
    if (enteredName === null) return;
    const trimmedName = enteredName.trim();
    const hasControlCharacter = Array.from(trimmedName).some((character) => character.charCodeAt(0) < 32);
    if (!trimmedName || /[\\/:*?"<>|]/u.test(trimmedName) || hasControlCharacter) {
      setNotice({ message: "ファイル名を入力してください。記号 \\ / : * ? \" < > | や制御文字は使用できません。", isError: true });
      return;
    }
    const fileName = /\.json$/i.test(trimmedName) ? trimmedName : `${trimmedName}.json`;
    let url = "";
    try {
      const data = parseProject(project);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
      url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      lastFileName.current = fileName;
      setNotice({ message: "JSONのダウンロードを開始しました。", isError: false });
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "JSONを保存できませんでした。", isError: true });
    } finally {
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  /** 複数ファイルを続けて選んだ場合も、最後に選んだファイルだけを適用する。 */
  async function readProjectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const sequence = ++importSequence.current;
    try {
      const restoredProject = parseProjectJson(await file.text());
      if (sequence !== importSequence.current) return;
      onImport(restoredProject);
      lastFileName.current = file.name;
      setNotice({ message: "JSONから編集内容を復元しました。", isError: false });
    } catch (error) {
      if (sequence !== importSequence.current) return;
      setNotice({ message: error instanceof Error ? error.message : "JSONを読み込めませんでした。", isError: true });
    }
  }

  return {
    inputRef,
    notice,
    downloadProject,
    readProjectFile,
    openFilePicker: () => inputRef.current?.click(),
    clearNotice: () => setNotice({ message: "", isError: false }),
  };
}
