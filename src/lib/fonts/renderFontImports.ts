import type { ProjectData } from "@/types/project";
import { japaneseFonts, isJapaneseFont } from "./japaneseFonts";

/** 使用フォントの全ウェイトとアイコンを、専用styleの先頭に置く@importとして出力する。 */
export function renderFontImports(project: ProjectData): string {
  const families = new Set([isJapaneseFont(project.pageSettings.defaultFontFamily) ? project.pageSettings.defaultFontFamily : "Noto Sans JP"]);
  project.blocks.forEach(({ settings }) => {
    if ("typography" in settings && isJapaneseFont(settings.typography.fontFamily)) families.add(settings.typography.fontFamily);
    if ("titleTypography" in settings && isJapaneseFont(settings.titleTypography.fontFamily)) families.add(settings.titleTypography.fontFamily);
  });
  const urls = [...families].map((family) => {
    const font = japaneseFonts.find((entry) => entry.family === family)!;
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replaceAll("%20", "+")}:wght@${font.weights}&display=swap`;
  });
  urls.push("https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=progress_activity&display=block");
  /** style内はHTMLエンティティを解釈しないため、URLの&はそのまま出力する。 */
  return urls.map((url) => `@import url("${url}");`).join(" ");
}
