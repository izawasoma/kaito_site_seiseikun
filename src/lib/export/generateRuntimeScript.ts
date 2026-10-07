import codeBlocksSource from "./runtime/codeBlocks.js?raw";
import pageHelpSource from "./runtime/pageHelp.js?raw";
import progressStorageSource from "./runtime/progressStorage.js?raw";
import answersSource from "./runtime/answers.js?raw";
import typewriterSource from "./runtime/typewriter.js?raw";
import progressionSource from "./runtime/progression.js?raw";
import bootstrapSource from "./runtime/bootstrap.js?raw";

/**
 * ビルド時の関数名変更に依存せず、独立して動くJavaScriptを生成する。
 * @remarks ソース内はブロックコメントを使い、autop対策として改行を空白にする。
 */
export function generateRuntimeScript(): string {
  const source = [typewriterSource, progressStorageSource, answersSource, progressionSource, pageHelpSource, codeBlocksSource, bootstrapSource].join("\n");
  return `<script>(function () { "use strict"; ${source.replace(/\r?\n/g, " ")} })();</script>`;
}
