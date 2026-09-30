import type { TitleBlock } from "@/types/project";

/**
 * タイトルブロックの初期データを作る。プロジェクトへの追加は行わない。
 * 呼び出すたびに、新しいIDと独立した設定オブジェクトを生成する。
 *
 * @returns 本文が空の、新規追加用タイトルブロック。
 */
export function createTitleBlock(): TitleBlock {
  return {
    id: crypto.randomUUID(),
    type: "title",
    afterPreviousTyping: false, simultaneous: false,
    settings: {
      text: "",
      typography: {
        alignment: "left",
        fontFamily: "inherit",
        fontWeight: "medium",
        fontSize: "24",
      },
      typewriter: true,
    },
  };
}
