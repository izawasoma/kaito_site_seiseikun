import type { ProjectData } from "@/types/project";
import { escapeHtml } from "./escapeHtml";
import { usesReaderProgress } from "@/lib/project/pageHelp";

/** 入力された案内はHTMLとして実行せず、改行だけを表示に反映する。 */
export function renderLecture(project: ProjectData): string {
  if (!project.pageSettings.showLecture) return "";
  const text = escapeHtml(project.pageSettings.lectureText).replace(/\r?\n/g, '<br data-conversation-break="">');
  return `<aside class="conversation-lecture" aria-label="このページの遊び方"><div class="conversation-lecture-heading">このページの遊び方</div><div>${text}</div></aside>`;
}

/** 進捗保存対象かつキー設定済みのページだけに、常時表示の削除ボタンを出力する。 */
export function renderProgressFooter(project: ProjectData): string {
  if (!project.pageSettings.showProgressReset || !usesReaderProgress(project) || !project.pageSettings.progressStorageKey.trim()) return "";
  return '<div class="conversation-progress-footer" data-progress-footer><button type="button" class="conversation-progress-reset" data-progress-reset>このページの進捗を削除</button></div>';
}
