import type { AnswerCommonSettings, AnswerFieldValue, ProjectBlock } from "@/types/project";
import type { TypographyValue } from "@/components/editor/fields/TypographyFields";
import { createSpeechBlock } from "./createSpeechBlock";
import { createTitleBlock } from "./createTitleBlock";
import { createTextBlock } from "./createTextBlock";
import { theme } from "@/styles/theme";

/** ブロック間で設定オブジェクトを共有しない文字設定の初期値。 */
function typography(size = "16"): TypographyValue {
  return { alignment: "left", fontFamily: "inherit", fontWeight: "medium", fontSize: size };
}

/** 多答回答への追加にも使用する解答欄の初期値。 */
export function createAnswerField(): AnswerFieldValue {
  return { id: crypto.randomUUID(), type: "text", label: "", placeholder: "", beforeText: "", afterText: "", candidates: [], choices: [] };
}

/** 回答ブロック共通の初期値。 */
function answerDefaults(): AnswerCommonSettings {
  return { instruction: "", submitLabel: "送信", successMessage: "正解です", errorMessage: "答えが違います。もう一度入力してください。",
    animation: "shake", action: { type: "next", url: "" }, typography: typography() };
}

/** メニューで選んだ種類のブロックを新しい固定IDで生成する。 */
export function createBlock(type: ProjectBlock["type"]): ProjectBlock {
  const base = { id: crypto.randomUUID(), afterPreviousTyping: false, simultaneous: false };
  switch (type) {
    case "speech": return createSpeechBlock();
    case "title": return createTitleBlock();
    case "text": return createTextBlock();
    case "image": return { ...base, type, settings: { url: "", alt: "", width: 650 } };
    case "icon": return { ...base, type, settings: { title: "", text: "", icon: "check",
      backgroundColor: theme.colors.red, textColor: theme.colors.white, rounded: true,
      titleTypography: typography("24"), typography: typography() } };
    case "button": return { ...base, type, settings: { text: "次へ", action: { type: "next", url: "" },
      backgroundColor: theme.colors.purple, textColor: theme.colors.white, typography: typography("18") } };
    case "answer": return { ...base, type, settings: { ...answerDefaults(), answer: createAnswerField() } };
    case "multiAnswer": return { ...base, type, settings: { ...answerDefaults(), answers: [createAnswerField()], showIndividualResults: true } };
  }
}
