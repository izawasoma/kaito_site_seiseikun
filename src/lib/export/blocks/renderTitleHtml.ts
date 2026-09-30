import { renderBlockAttributes } from "../renderBlockAttributes";
import { escapeHtml } from "../escapeHtml";
import { renderDecoratedText } from "../renderDecoratedText";
import { renderTypographyStyle } from "../renderTypographyStyle";
import type { TitleBlock } from "@/types/project";

/**
 * タイトルを、装飾と文字設定を含むHTMLへ変換する。
 * @param titleBlock - 表示するタイトルブロック。
 * @returns 書き出しとプレビューで共用する見出しのHTML。
 */
export function renderTitleHtml(titleBlock: TitleBlock): string {
  const titleStyle = renderTypographyStyle(titleBlock.settings.typography, 24);
  const content = renderDecoratedText(titleBlock.settings.text);
  return `<h2 class="conversation-title" ${renderBlockAttributes(titleBlock)} style="${escapeHtml(titleStyle)}">${content}</h2>`;
}
