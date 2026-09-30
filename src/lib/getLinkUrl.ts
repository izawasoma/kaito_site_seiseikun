/** HTTP(S)・相対パス・ページ内アンカーを許可し、スクリプト等のURLを拒否する。 */
export function getLinkUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed, "https://validation.invalid/");
    return ["http:", "https:"].includes(parsed.protocol) ? trimmed : "";
  } catch { return ""; }
}
