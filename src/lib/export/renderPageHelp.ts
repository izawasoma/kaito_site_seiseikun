import type { ProjectData } from "@/types/project";
import { renderDecoratedText } from "./renderDecoratedText";
import { usesReaderProgress } from "@/lib/project/pageHelp";

/** 案内のルビ・色・太字・改行を共通の装飾処理で変換し、任意HTMLは実行しない。 */
export function renderLecture(project: ProjectData): string {
  if (!project.pageSettings.showLecture) return "";
  const text = renderDecoratedText(project.pageSettings.lectureText);
  return `<aside class="conversation-lecture" aria-label="このページの遊び方"><div class="conversation-lecture-heading">このページの遊び方</div><div>${text}</div></aside>`;
}

/** 進捗保存対象かつキー設定済みのページだけに、常時表示の削除ボタンを出力する。 */
export function renderProgressFooter(project: ProjectData): string {
  if (!project.pageSettings.showProgressReset || !usesReaderProgress(project) || !project.pageSettings.progressStorageKey.trim()) return "";
  return '<div class="conversation-progress-footer" data-progress-footer><button type="button" class="conversation-progress-reset" data-progress-reset>このページの進捗を削除</button></div>';
}
