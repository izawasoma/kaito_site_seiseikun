import type { IconBlock, ImageBlock, ButtonBlock } from "@/types/project";
import { escapeHtml } from "../escapeHtml";
import { renderBlockAttributes } from "../renderBlockAttributes";
import { renderTypographyStyle } from "../renderTypographyStyle";
import { renderDecoratedText } from "../renderDecoratedText";
import { getImageUrl } from "@/lib/getImageUrl";
import { getLinkUrl } from "@/lib/getLinkUrl";

/** CSSへは6桁の色だけを渡し、編集中の不完全な値は既定色に置き換える。 */
function color(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/** 見出しと本文の文字設定を独立して出力する。 */
export function renderIconHtml(block: IconBlock): string {
  const settings = block.settings;
  const icon = /^[a-z0-9_]+$/.test(settings.icon) ? settings.icon : "check";
  const style = `background-color:${color(settings.backgroundColor, "#F35457")};color:${color(settings.textColor, "#ffffff")};border-radius:calc(${settings.rounded ? 8 : 0}px * var(--conversation-scale, 1))`;
  return `<div class="conversation-card" ${renderBlockAttributes(block)} style="${style}"><div class="conversation-card-title" style="${escapeHtml(renderTypographyStyle(settings.titleTypography, 24))}"><span class="conversation-material-icon" aria-hidden="true">${icon}</span> ${renderDecoratedText(settings.title)}</div><div class="conversation-card-body" style="${escapeHtml(renderTypographyStyle(settings.typography, 16))}">${renderDecoratedText(settings.text)}</div></div>`;
}

/** 画像は選択幅を上限として、親の幅を超えない形で出力する。 */
export function renderImageHtml(block: ImageBlock): string {
  const url = getImageUrl(block.settings.url);
  const width = [500, 650, 860].includes(block.settings.width) ? block.settings.width : 650;
  return `<div class="conversation-image" ${renderBlockAttributes(block)}>${url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(block.settings.alt)}" style="width:100%;max-width:calc(${width}px * var(--conversation-scale, 1));height:auto">` : ""}</div>`;
}

/** 進行とリンクのボタンを、共通ランタイムで扱える属性付きで出力する。 */
export function renderButtonHtml(block: ButtonBlock): string {
  const settings = block.settings;
  const style = `${renderTypographyStyle(settings.typography, 18)};background-color:${color(settings.backgroundColor, "#3E0B4D")};color:${color(settings.textColor, "#ffffff")}`;
  return `<div class="conversation-button-block" ${renderBlockAttributes(block)}><button type="button" class="conversation-action" style="${escapeHtml(style)}" data-conversation-action="${settings.action.type === "link" ? "link" : "next"}" data-allow-repeat="${settings.action.allowRepeat === true}" data-url="${escapeHtml(getLinkUrl(settings.action.url))}">${escapeHtml(settings.text)}</button></div>`;
}
