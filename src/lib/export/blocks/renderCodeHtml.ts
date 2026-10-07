import { fontFamilyStyle } from "@/lib/fonts/japaneseFonts";
import { renderFontImports } from "@/lib/fonts/renderFontImports";
import type { CodeBlock, PageSettingsValue } from "@/types/project";
import { escapeHtml } from "../escapeHtml";
import { renderBlockAttributes } from "../renderBlockAttributes";

/** 入力コードを属性内のJSONで保持し、wpautopやscript終了タグの影響を防ぐ。 */
export function renderCodeHtml(block: CodeBlock, pageSettings: PageSettingsValue): string {
  const defaultCss = `${renderFontImports({ schemaVersion: 1, pageSettings, blocks: [] })} :where(body){font-family:${fontFamilyStyle(pageSettings.defaultFontFamily)}} :where(input,button,select,textarea){font-family:inherit}`;
  const payload = escapeHtml(JSON.stringify({ ...block.settings, defaultCss }));
  return `<div class="conversation-code" ${renderBlockAttributes(block)}><iframe title="HTMLコード" sandbox="allow-scripts allow-forms" data-code-settings="${payload}" style="display:block;width:100%;height:1px;border:0"></iframe></div>`;
}
