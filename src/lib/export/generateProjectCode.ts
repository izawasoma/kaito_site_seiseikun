import { renderCodeHtml } from "./blocks/renderCodeHtml";
import { renderLecture, renderProgressFooter } from "./renderPageHelp";
import { pageHelpStyles } from "./pageHelpStyles";
import { supportedFontWeight } from "@/lib/fonts/fontWeights";
import { renderFontImports } from "@/lib/fonts/renderFontImports";
import { renderIconHtml, renderImageHtml, renderButtonHtml } from "./blocks/renderVisualBlocks";
import { renderAnswerHtml } from "./blocks/renderAnswerHtml";
import { interactiveStyles } from "./interactiveStyles";
import { renderTitleHtml } from "@/lib/export/blocks/renderTitleHtml";
import { renderTextHtml } from "./blocks/renderTextHtml";
import { renderSpeechHtml } from "./blocks/renderSpeechHtml";
import { speechStyles } from "./speechStyles";
import { pageStyles } from "@/lib/export/pageStyles";
import type { ProjectData } from "@/types/project";
import { renderPageAttributes } from "./renderPageAttributes";
import { generateRuntimeScript } from "./generateRuntimeScript";

/**
 * WordPressへの貼り付けとプレビューに使用する生成コード。
 */
export type GeneratedProjectCode = {
  /** styleタグとページ本文をまとめたHTML。 */
  htmlCss: string;
  /** scriptタグを含むJavaScript。動作が不要な段階では空文字列。 */
  javascript: string;
};

/**
 * プロジェクトデータから、表示に必要なコードを生成する。
 *
 * @remarks
 * ブロック配列の順序を、そのままHTMLの表示順に使用する。
 * 元のプロジェクトデータは変更しない。
 * 通常表示以外では、同じ表示制御JavaScriptをプレビューと書き出しへ渡す。
 *
 * @param project - 書き出すプロジェクトデータ。
 * @returns HTML・CSSとJavaScriptの生成結果。
 */
export function generateProjectCode(
  project: ProjectData,
): GeneratedProjectCode {
  const blockHtmlList = project.blocks.map((sourceBlock) => {
    const projectBlock = structuredClone(sourceBlock);
    const settings = projectBlock.settings;
    for (const typography of ["typography" in settings ? settings.typography : null, "titleTypography" in settings ? settings.titleTypography : null]) {
      if (typography) typography.fontWeight = supportedFontWeight(typography.fontFamily === "inherit" ? project.pageSettings.defaultFontFamily : typography.fontFamily, typography.fontWeight);
    }
    switch (projectBlock.type) {
      case "code": return renderCodeHtml(projectBlock);
      case "icon": return renderIconHtml(projectBlock);
      case "image": return renderImageHtml(projectBlock);
      case "button": return renderButtonHtml(projectBlock);
      case "answer": case "multiAnswer": return renderAnswerHtml(projectBlock);
      case "speech":
        return renderSpeechHtml(projectBlock);
      case "title":
        return renderTitleHtml(projectBlock);
      case "text":
        return renderTextHtml(projectBlock);
    }
  });

  const pageContent = blockHtmlList.join("\n");
  const pageAttributes = renderPageAttributes(project.pageSettings);
  /** CSS内の空行をautopが段落へ変換しないよう、出力時だけ1行にする。 */
  const hasSpeech = project.blocks.some((block) => block.type === "speech");
  const combinedStyles = [pageStyles, hasSpeech ? speechStyles : "", interactiveStyles, pageHelpStyles].join("\n");
  const inlinePageStyles = combinedStyles.replace(/\r?\n/g, " ");

  const htmlCss = [
    `<style>${inlinePageStyles}</style>`,
    `<style>${renderFontImports(project)}</style>`,
    `<div class="conversation-page" ${pageAttributes}>`,
    renderLecture(project),
    pageContent,
    renderProgressFooter(project),
    "</div>",
  ].join("\n");

  return {
    htmlCss,
    javascript: !renderProgressFooter(project) && project.pageSettings.displayMode === "normal" && !project.blocks.some((block) => ["answer", "multiAnswer", "button", "code"].includes(block.type)) ? "" : generateRuntimeScript(),
  };
}
