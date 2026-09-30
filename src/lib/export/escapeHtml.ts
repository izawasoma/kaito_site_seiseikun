/**
 * テキストをHTMLの本文やダブルクォートで囲んだ属性値に
 * 安全に埋め込める文字列へ変換する。
 *
 * @param text - 変換する文字列。
 * @returns HTMLの特殊文字をエスケープした文字列。
 */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
