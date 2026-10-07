import { theme } from "@/styles/theme";

/**
 * 書き出すページに適用する共通CSS。
 *
 * @remarks
 * WordPressの周囲の要素へ影響しないよう、
 * 本文のスタイルはconversation-page内に限定する。
 * 先頭は、ビジュアルモードへの切り替えで最初のルールが壊れる場合に備えたガード。
 */
export const pageStyles = `
.guard-style{display:block}

.conversation-page {
  --conversation-scale: 1;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  font-family: "Noto Sans JP", sans-serif;
  font-weight: ${theme.fontWeights.regular};
  color: ${theme.colors.black};
}

@media (max-width: 767px) {
  .conversation-page { --conversation-scale: 1.5; }
}

html[data-conversation-preview-device="pc"] .conversation-page {
  --conversation-scale: 1;
}

html[data-conversation-preview-device="sp"] .conversation-page {
  --conversation-scale: 1.5;
}

.conversation-page h2.conversation-title,
.conversation-page p.conversation-text {
  margin: 0 0 calc(18px * var(--conversation-scale, 1));
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  overflow-wrap: anywhere;
}

.conversation-page p.conversation-text--rpg {
  box-sizing: border-box;
  width: 100%;
  padding: calc(16px * var(--conversation-scale, 1));
  border: calc(3px * var(--conversation-scale, 1)) double ${theme.colors.white};
  background: ${theme.colors.black};
  color: ${theme.colors.white};
  line-height: 1.5;
}

.conversation-page .conversation-code { margin: 0 0 calc(18px * var(--conversation-scale, 1)); }

/* ルビを均等に広げず、親文字の中央にまとめて配置する（中付き）。 */
.conversation-page ruby {
  ruby-align: center;
}

.conversation-page rt {
  text-align: center;
}

.conversation-page [hidden] {
  display: none !important;
}

.conversation-page button {
  transition: opacity 0.2s ease;
}

@media (hover: hover) {
  .conversation-page button:hover:not(:disabled):not([aria-disabled="true"]) {
    opacity: 0.7;
  }
  .conversation-page .conversation-advance:hover:not(:disabled) {
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .conversation-page button { transition: none; }
}

.conversation-page .conversation-scroll-pending {
  opacity: 0;
  visibility: hidden;
}

.conversation-page .conversation-enter {
  animation: conversation-fade-in 300ms ease-out both;
}

@keyframes conversation-fade-in {
  from { opacity: 0; transform: translateY(calc(8px * var(--conversation-scale, 1))); }
  to { opacity: 1; transform: translateY(0); }
}

.conversation-page .conversation-advance {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(8px * var(--conversation-scale, 1));
  width: fit-content;
  margin: calc(8px * var(--conversation-scale, 1)) auto calc(18px * var(--conversation-scale, 1));
  padding: calc(8px * var(--conversation-scale, 1)) calc(12px * var(--conversation-scale, 1));
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: calc(16px * var(--conversation-scale, 1));
  font-weight: ${theme.fontWeights.bold};
  line-height: 1.5;
  cursor: pointer;
  animation: conversation-advance-pulse 2s ease-in-out infinite;
}

.conversation-page .conversation-advance-icon {
  font-family: "Material Icons";
  font-size: calc(24px * var(--conversation-scale, 1));
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

@keyframes conversation-advance-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.conversation-page .conversation-advance:focus-visible {
  outline: calc(2px * var(--conversation-scale, 1)) solid currentColor;
  outline-offset: calc(2px * var(--conversation-scale, 1));
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .conversation-page .conversation-enter,
  .conversation-page .conversation-advance { animation: none; }
}
`.trim();
