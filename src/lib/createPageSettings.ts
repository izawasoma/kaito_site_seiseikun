import { defaultLectureText } from "./project/pageHelp";
import type { PageSettingsValue } from "@/types/project";

/** 新規プロジェクト用の、独立したページ設定オブジェクトを生成する。 */
export function createPageSettings(): PageSettingsValue {
  return {
    progressStorageKey: "",
    defaultTextColor: "#333333",
    defaultFontFamily: "Noto Sans JP",
    displayMode: "normal",
    typewriterInterval: 40,
    showLecture: false,
    lectureText: defaultLectureText,
    showProgressReset: false,
  };
}
