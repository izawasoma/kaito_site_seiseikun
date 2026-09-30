import { renderBlockAttributes } from "../renderBlockAttributes";
import { escapeHtml } from "../escapeHtml";
import { renderDecoratedText } from "../renderDecoratedText";
import { renderTypographyStyle } from "../renderTypographyStyle";
import type { TextBlock } from "@/types/project";

/**
 * 通常テキストを、装飾・改行・文字設定を含むHTMLへ変換する。
 * @param textBlock - 表示するテキストブロック。
 * @returns 書き出しとプレビューで共用する段落のHTML。
 */
export function renderTextHtml(textBlock: TextBlock): string {
  const textStyle = renderTypographyStyle(textBlock.settings.typography, 16);
  const content = renderDecoratedText(textBlock.settings.text);
  const themeClass = textBlock.settings.textTheme === "rpg" ? " conversation-text--rpg" : "";
  return `<p class="conversation-text${themeClass}" ${renderBlockAttributes(textBlock)} style="${escapeHtml(textStyle)}">${content}</p>`;
}
