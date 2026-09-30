import { theme } from "@/styles/theme";

/**
 * 書き出すページに適用する共通CSS。
 *
 * @remarks
 * WordPressの周囲の要素へ影響しないよう、
 * スタイルの対象をconversation-page内に限定する。
 */
export const pageStyles = `
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap");

.conversation-page {
  font-family: "Noto Sans JP", sans-serif;
  font-weight: ${theme.fontWeights.regular};
  color: ${theme.colors.black};
}

.conversation-page h2.conversation-title,
.conversation-page p.conversation-text {
  margin: 0 0 18px;
  padding: 0;
  border: 0;
  background: none;
  overflow-wrap: anywhere;
}
`.trim();
