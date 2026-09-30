import { theme } from "@/styles/theme";

/** 吹き出しの3テーマ。名前は本文の上に配置し、画像ファイルは装飾に使用しない。 */
export const speechStyles = `
.conversation-page .conversation-speech,
.conversation-page .conversation-speech * {
  box-sizing: border-box;
}
.conversation-page .conversation-speech {
  display: flex;
  align-items: flex-start;
  gap: calc(24px * var(--conversation-scale, 1));
  margin: 0 0 calc(18px * var(--conversation-scale, 1));
  width: 100%;
  line-height: 1.5;
  color: inherit;
}
.conversation-page .conversation-speech-avatar {
  flex: 0 0 calc(80px * var(--conversation-scale, 1));
  width: calc(80px * var(--conversation-scale, 1));
  min-height: calc(80px * var(--conversation-scale, 1));
}
.conversation-page .conversation-speech-avatar img {
  display: block;
  width: calc(80px * var(--conversation-scale, 1));
  height: calc(80px * var(--conversation-scale, 1));
  max-width: 100%;
  margin: 0;
  object-fit: contain;
}
.conversation-page .conversation-speech-content {
  flex: 1;
  min-width: 0;
}
.conversation-page .conversation-speech-name {
  margin: 0 0 calc(6px * var(--conversation-scale, 1));
  font-size: calc(14px * var(--conversation-scale, 1));
  font-weight: ${theme.fontWeights.bold};
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.conversation-page .conversation-speech-bubble {
  position: relative;
  padding: calc(12px * var(--conversation-scale, 1)) calc(16px * var(--conversation-scale, 1));
  border: calc(2px * var(--conversation-scale, 1)) solid ${theme.colors.black};
  background: ${theme.colors.white};
}
.conversation-page .conversation-speech-bubble::before,
.conversation-page .conversation-speech-bubble::after {
  content: "";
  position: absolute;
  top: calc(12px * var(--conversation-scale, 1));
  left: calc(-18px * var(--conversation-scale, 1));
  border-top: calc(10px * var(--conversation-scale, 1)) solid transparent;
  border-bottom: calc(10px * var(--conversation-scale, 1)) solid transparent;
  border-right: calc(18px * var(--conversation-scale, 1)) solid ${theme.colors.black};
}
.conversation-page .conversation-speech-bubble::after {
  left: calc(-14px * var(--conversation-scale, 1));
  border-right-color: ${theme.colors.white};
}
.conversation-page p.conversation-speech-message {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  overflow-wrap: anywhere;
}
.conversation-page .conversation-speech--rounded .conversation-speech-bubble {
  border-radius: calc(16px * var(--conversation-scale, 1));
}
.conversation-page .conversation-speech--rpg {
  gap: calc(16px * var(--conversation-scale, 1));
  padding: calc(16px * var(--conversation-scale, 1));
  border: calc(3px * var(--conversation-scale, 1)) double ${theme.colors.white};
  background: ${theme.colors.black};
  color: ${theme.colors.white};
}
.conversation-page .conversation-speech--rpg .conversation-speech-bubble {
  padding: 0;
  border: 0;
  background: transparent;
}
.conversation-page .conversation-speech--rpg .conversation-speech-bubble::before,
.conversation-page .conversation-speech--rpg .conversation-speech-bubble::after {
  display: none;
}
`.trim();
