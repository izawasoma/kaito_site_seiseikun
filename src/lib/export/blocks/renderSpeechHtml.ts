import type { SpeechBlock } from "@/types/project";
import { getImageUrl } from "@/lib/getImageUrl";
import { escapeHtml } from "../escapeHtml";
import { renderBlockAttributes } from "../renderBlockAttributes";
import { renderDecoratedText } from "../renderDecoratedText";
import { renderTypographyStyle } from "../renderTypographyStyle";

/** キャラクター画像・名前・本文を含む吹き出しを、自己完結したHTMLへ変換する。 */
export function renderSpeechHtml(block: SpeechBlock): string {
  const settings = block.settings;
  const variant = ["rpg", "normal", "rounded"].includes(settings.speechTheme)
    ? settings.speechTheme : "rpg";
  const imageUrl = getImageUrl(settings.imageUrl);
  const avatar = imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" width="80" height="80">` : "";
  const style = escapeHtml(renderTypographyStyle(settings.typography, 16));

  return [
    `<div class="conversation-speech conversation-speech--${variant}" ${renderBlockAttributes(block)} style="${style}">`,
    `<div class="conversation-speech-avatar">${avatar}</div>`,
    '<div class="conversation-speech-content">',
    `<div class="conversation-speech-name">${renderDecoratedText(settings.characterName)}</div>`,
    '<div class="conversation-speech-bubble">',
    `<p class="conversation-speech-message" data-typewriter-content>${renderDecoratedText(settings.text)}</p>`,
    "</div></div></div>",
  ].join("");
}
