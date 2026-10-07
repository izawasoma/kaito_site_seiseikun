import type { CodeBlock } from "@/types/project";
import { escapeHtml } from "../escapeHtml";
import { renderBlockAttributes } from "../renderBlockAttributes";

/** コードを属性内のJSONで保持し、WordPressの自動整形を避けて本文へ復元する。 */
export function renderCodeHtml(block: CodeBlock): string {
  const payload = escapeHtml(JSON.stringify(block.settings));
  return `<div class="conversation-code" ${renderBlockAttributes(block)} data-code-settings="${payload}"></div>`;
}
