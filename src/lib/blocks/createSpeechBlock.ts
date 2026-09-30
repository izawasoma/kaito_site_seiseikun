import type { SpeechBlock } from "@/types/project";

/** キャラクター未選択の吹き出しブロックを、新しいIDで生成する。 */
export function createSpeechBlock(): SpeechBlock {
  return {
    id: crypto.randomUUID(),
    type: "speech",
    afterPreviousTyping: false, simultaneous: false,
    settings: {
      imageUrl: "",
      characterName: "",
      text: "",
      speechTheme: "rpg",
      typography: {
        alignment: "left",
        fontFamily: "inherit",
        fontWeight: "medium",
        fontSize: "16",
      },
    },
  };
}
