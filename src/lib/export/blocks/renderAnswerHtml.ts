import type { AnswerBlock, MultiAnswerBlock, AnswerFieldValue } from "@/types/project";
import { escapeHtml } from "../escapeHtml";
import { renderBlockAttributes } from "../renderBlockAttributes";
import { renderTypographyStyle } from "../renderTypographyStyle";
import { renderDecoratedText } from "../renderDecoratedText";
import { getLinkUrl } from "@/lib/getLinkUrl";

/** 各入力のIDはブロックIDを含め、複製後もラベルの参照先を重複させない。 */
function renderField(blockId: string, field: AnswerFieldValue, index: number, individual: boolean): string {
  const id = escapeHtml(`${blockId}-${field.id}`);
  const label = escapeHtml(field.label || `回答${index + 1}`);
  let input: string;
  if (field.type === "text") {
    input = `<input type="text" id="${id}" autocomplete="off" placeholder="${escapeHtml(field.placeholder)}" aria-label="${label}">`;
  } else if (field.type === "single") {
    input = `<select id="${id}" aria-label="${label}"><option value="">選択してください</option>${field.choices.map((choice) => `<option value="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}</option>`).join("")}</select>`;
  } else {
    input = `<div class="conversation-choices" role="group" aria-label="${label}">${field.choices.map((choice) => `<label><input type="checkbox" value="${escapeHtml(choice.id)}"><span>${escapeHtml(choice.label)}</span></label>`).join("")}</div>`;
  }
  const before = field.type !== "multiple" && field.beforeText ? `<div class="conversation-answer-before">${escapeHtml(field.beforeText)}</div>` : "";
  const after = field.type !== "multiple" && field.afterText ? `<div class="conversation-answer-after">${escapeHtml(field.afterText)}</div>` : "";
  return `<div class="conversation-answer-row" data-answer-field="${escapeHtml(field.id)}">${field.label ? `<div class="conversation-answer-label">${label}</div>` : ""}${before}<div class="conversation-answer-input">${input}</div>${after}${individual ? '<div class="conversation-answer-result"><small>判定</small><span data-field-result aria-live="polite">—</span></div>' : ""}</div>`;
}

/** 正解候補は属性のJSONとしてエスケープし、実行可能なコードとして埋め込まない。 */
export function renderAnswerHtml(block: AnswerBlock | MultiAnswerBlock): string {
  const settings = block.settings;
  const fields = block.type === "answer" ? [block.settings.answer] : block.settings.answers;
  const individual = block.type === "multiAnswer" && block.settings.showIndividualResults;
  const config = { multiple: block.type === "multiAnswer", fields, action: { ...settings.action, url: getLinkUrl(settings.action.url) }, errorMessage: settings.errorMessage, successMessage: settings.successMessage, animation: settings.animation, individual };
  return `<form class="conversation-answer" ${renderBlockAttributes(block)} data-answer-config="${escapeHtml(JSON.stringify(config))}" style="${escapeHtml(renderTypographyStyle(settings.typography, 16))}" novalidate>${settings.instruction ? `<div class="conversation-answer-instruction"><span class="conversation-material-icon" aria-hidden="true">edit</span> ${renderDecoratedText(settings.instruction)}</div>` : ""}<div class="conversation-answer-fields">${fields.map((field, index) => renderField(block.id, field, index, individual)).join("")}</div><button class="conversation-submit" type="submit">${escapeHtml(settings.submitLabel)}</button><div class="conversation-answer-feedback" role="status" aria-live="polite"></div></form>`;
}
