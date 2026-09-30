import { renderTitleHtml } from "@/lib/export/blocks/renderTitleHtml";
import { renderTextHtml } from "./blocks/renderTextHtml";
import { pageStyles } from "@/lib/export/pageStyles";
import type { ProjectData } from "@/types/project";

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
 * 現在は静的なタイトルとテキストのみのため、JavaScriptは生成しない。
 *
 * @param project - 書き出すプロジェクトデータ。
 * @returns HTML・CSSとJavaScriptの生成結果。
 */
export function generateProjectCode(
  project: ProjectData,
): GeneratedProjectCode {
  const blockHtmlList = project.blocks.map((projectBlock) => {
    switch (projectBlock.type) {
      case "title":
        return renderTitleHtml(projectBlock);
      case "text":
        return renderTextHtml(projectBlock);
    }
  });

  const pageContent = blockHtmlList.join("\n");
  /** CSS内の空行をautopが段落へ変換しないよう、出力時だけ1行にする。 */
  const inlinePageStyles = pageStyles.replace(/\r?\n/g, " ");

  const htmlCss = [
    `<style>${inlinePageStyles}</style>`,
    '<div class="conversation-page">',
    pageContent,
    "</div>",
  ].join("\n");

  return {
    htmlCss,
    javascript: "",
  };
}
