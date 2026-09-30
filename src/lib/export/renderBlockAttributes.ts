import type { ProjectBlock } from "@/types/project";
import { escapeHtml } from "./escapeHtml";

/** ブロック固有のID・文字送り・同時表示設定を、実行用の属性として出力する。 */
export function renderBlockAttributes(block: ProjectBlock): string {
  const typewriterEnabled = block.type === "speech" || ((block.type === "title" || block.type === "text") && block.settings.typewriter);
  const isLock = block.type === "answer" || block.type === "multiAnswer" || (block.type === "button" && block.settings.action.type === "next");
  return [
    `data-after-previous-typing="${block.afterPreviousTyping === true}"`,
    `data-lock="${isLock}"`,
    `data-block-id="${escapeHtml(block.id)}"`,
    `data-typewriter="${typewriterEnabled}"`,
    `data-simultaneous="${block.simultaneous}"`,
  ].join(" ");
}
