import type { TextBlock } from "@/types/project";

/**
 * 本文が空の通常テキストブロックを生成する。
 * @returns 新しいIDと独立した設定を持つブロック。
 */
export function createTextBlock(): TextBlock {
  return {
    id: crypto.randomUUID(),
    type: "text",
    simultaneous: false,
    settings: {
      text: "",
      typography: {
        alignment: "left",
        fontFamily: "Noto Sans JP",
        fontWeight: "medium",
        fontSize: "16",
      },
      typewriter: true,
    },
  };
}
