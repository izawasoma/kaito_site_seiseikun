import previewBridge from "./previewBridge.js?raw";
import { autop } from "@wordpress/autop";
import type { GeneratedProjectCode } from "@/lib/export/generateProjectCode";
import { wordpressPcStyles, wordpressSpStyles } from "./wordpressStyles";
import { previewEnvironments, type PreviewDevice } from "./previewEnvironment";

/**
 * 記事本文を、指定したテーマの親要素で囲む。
 *
 * @param postContent - autop適用後の記事本文。
 * @param device - 再現する表示環境。
 * @returns テーマの本文構造を含むHTML。
 */
function wrapPostContent(postContent: string, device: PreviewDevice): string {
  const articleHtml = `
<article class="single">
  <div class="area_hint03">
${postContent}
  </div>
</article>`;

  if (device === "sp") {
    return `
<div class="contents">
  <div class="hintpage">
${articleHtml}
  </div>
</div>`;
  }

  return `
<div class="contents_wrapper contents_wrapper_contents001">
  <div class="contents clearfix">
    <div class="main onecol hintpage">
${articleHtml}
    </div>
  </div>
</div>`;
}

/**
 * 生成コードを指定したWordPress疑似環境に配置する。
 *
 * @remarks
 * autopは、WordPressへ貼り付ける本文全体に一度だけ適用する。
 * テーマCSSやプレビュー用の外枠は処理対象に含めない。
 * この疑似環境用HTMLは、WordPressへの書き出しには使用しない。
 *
 * @param generatedCode - 共通処理で生成したコード。
 * @param device - 再現する表示環境。省略時はPC。
 * @returns iframeのsrcDocへ渡すHTML文書。
 */
export function buildPreviewDocument(
  generatedCode: GeneratedProjectCode,
  device: PreviewDevice = "pc",
  unlockAll = false,
): string {
  const environment = previewEnvironments[device];
  const wordpressStyles =
    device === "pc" ? wordpressPcStyles : wordpressSpStyles;

  const postContent = [generatedCode.htmlCss, generatedCode.javascript].join(
    "\n",
  );

  const formattedPostContent = autop(postContent);
  const wrappedPostContent = wrapPostContent(formattedPostContent, device);

  return `<!doctype html>
<html lang="ja" data-conversation-preview-device="${device}" data-conversation-preview-unlock="${unlockAll}">
<head>
  <meta charset="UTF-8">
  <script>${previewBridge}</script>
  <meta name="viewport" content="${environment.viewport}">
  <title>プレビュー</title>
  <style>
${wordpressStyles}
  </style>
</head>
<body class="hint-template-default single single-hint">
${wrappedPostContent}
</body>
</html>`;
}
