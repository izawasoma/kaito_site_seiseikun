import { fontFamilyStyle } from "@/lib/fonts/japaneseFonts";
import type { PageSettingsValue } from "@/types/project";
import { escapeHtml } from "./escapeHtml";

/**
 * ページ設定を、本文のルート要素に設定する属性へ変換する。
 * @remarks 任意の入力をCSSとして実行しないよう、文字色とフォントは許可値のみ出力する。
 * @param settings - 保存対象のページ設定。
 * @returns エスケープ済みの属性文字列。
 */
export function renderPageAttributes(settings: PageSettingsValue): string {
  const color = /^#[0-9a-f]{6}$/i.test(settings.defaultTextColor)
    ? settings.defaultTextColor : "#333333";
  const pageStyle = `color: ${color}; font-family: ${fontFamilyStyle(settings.defaultFontFamily)}`;
  const interval = Number.isFinite(settings.typewriterInterval) && settings.typewriterInterval >= 1
    ? settings.typewriterInterval : 40;

  return [
    `style="${escapeHtml(pageStyle)}"`,
    `data-display-mode="${escapeHtml(settings.displayMode)}"`,
    `data-progress-key="${escapeHtml(settings.progressStorageKey.trim())}"`,
    `data-show-lecture="${settings.showLecture}"`,
    `data-typewriter-interval="${interval}"`,
  ].join(" ");
}
