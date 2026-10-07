import { renderDecoratedText } from "./renderDecoratedText";

/** 装飾タグ・ルビの読み・改行を除き、本文の見た目の文字数を数える。 */
export function decoratedPlainText(text: string): string {
  return renderDecoratedText(text)
    .replace(/<r[tp]>[\s\S]*?<\/r[tp]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

/** 装飾を除いた親文字の数を数える。 */
export function countDecoratedCharacters(text: string): number {
  const plainText = decoratedPlainText(text);
  return Array.from(new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(plainText)).length;
}
