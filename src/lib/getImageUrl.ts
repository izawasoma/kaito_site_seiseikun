/** HTTP(S)の画像URLだけを許可する。未入力や入力途中、不正な方式は空文字列を返す。 */
export function getImageUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}
