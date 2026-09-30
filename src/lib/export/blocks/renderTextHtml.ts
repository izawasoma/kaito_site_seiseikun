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
  return `<p class="conversation-text" data-block-id="${escapeHtml(textBlock.id)}" style="${escapeHtml(textStyle)}">${content}</p>`;
}
