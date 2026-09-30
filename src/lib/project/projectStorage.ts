import type { ProjectData } from "@/types/project";
import { createPageSettings } from "@/lib/createPageSettings";
import { parseProject } from "./parseProject";

export const PROJECT_STORAGE_KEY = "kaito-site-seiseikun:editor:v1";

/** ローカル保存では制作データに加え、編集対象の選択も復元する。 */
export type EditorSnapshot = {
  project: ProjectData;
  selectedBlockId: string | null;
};

/** 初期読み込み結果。壊れた保存データは、空のデータで自動上書きしない。 */
export function loadEditorSession() {
  const emptySnapshot: EditorSnapshot = {
    project: { schemaVersion: 1, pageSettings: createPageSettings(), blocks: [] },
    selectedBlockId: null,
  };
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (raw === null) return { snapshot: emptySnapshot, error: "", canSave: true };
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !("project" in saved)) {
      throw new Error("保存形式が正しくありません。");
    }
    const project = parseProject(saved.project);
    const selectedId = "selectedBlockId" in saved ? saved.selectedBlockId : null;
    const selectedBlockId = project.blocks.some((block) => block.id === selectedId)
      ? selectedId as string : null;
    return { snapshot: { project, selectedBlockId }, error: "", canSave: true };
  } catch {
    return {
      snapshot: emptySnapshot,
      canSave: false,
      error: "編集データを復元できませんでした。保存済みデータの上書きを防ぐため自動保存を停止しています。作業内容はJSONで保存できます。正常なJSONを読み込むと自動保存を再開します。",
    };
  }
}

/** 選択状態を含めて保存する。容量不足などの例外は呼び出し側で案内する。 */
export function saveEditorSnapshot(snapshot: EditorSnapshot): void {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(snapshot));
}
