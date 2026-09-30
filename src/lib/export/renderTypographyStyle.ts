import { supportedFontWeight } from "@/lib/fonts/fontWeights";
import { fontFamilyStyle } from "@/lib/fonts/japaneseFonts";
import type { TypographyValue } from "@/components/editor/fields/TypographyFields";
import { theme } from "@/styles/theme";

/**
 * 文字設定を、許可された値だけで構成するインラインCSSへ変換する。
 * @remarks 設定値はPC基準。スマホでは共通CSSの倍率1.5を適用し、保存値は変更しない。
 * @param typography - ブロックの文字設定。
 * @param fallbackFontSize - サイズが未入力・不正な場合の表示サイズ。
 * @returns 属性へ埋め込む前のCSS文字列。
 */
export function renderTypographyStyle(
  typography: TypographyValue,
  fallbackFontSize: number,
): string {
  const requestedSize = Number(typography.fontSize);
  const fontSize =
    Number.isFinite(requestedSize) && requestedSize >= 1
      ? requestedSize
      : fallbackFontSize;
  const alignment = ["left", "center", "right"].includes(typography.alignment)
    ? typography.alignment
    : "left";
  const fontWeight = Object.hasOwn(theme.fontWeights, typography.fontWeight)
    ? theme.fontWeights[supportedFontWeight(typography.fontFamily, typography.fontWeight)]
    : theme.fontWeights.medium;
  const fontFamily = fontFamilyStyle(typography.fontFamily);

  return [
    `text-align: ${alignment}`,
    `font-family: ${fontFamily}`,
    `font-weight: ${fontWeight}`,
    `font-size: calc(${fontSize}px * var(--conversation-scale, 1))`,
  ].join("; ");
}
