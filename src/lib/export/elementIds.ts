import type { AnswerBlock, ButtonBlock, MultiAnswerBlock, ProjectBlock } from "@/types/project";

export type IdBlock = AnswerBlock | MultiAnswerBlock | ButtonBlock;
export function supportsCustomId(block: ProjectBlock): block is IdBlock {
  return block.type === "button" || block.type === "answer" || block.type === "multiAnswer";
}
export function customIdError(block: IdBlock): string | undefined {
  if (!block.settings.customIdEnabled) return;
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(block.settings.customId ?? "")) {
    return "独自IDは英字で始まる半角英数字・ハイフン・アンダースコアで入力してください。";
  }
}

/** 内部IDには触れず、表示順で要素種別ごとに採番する。 */
export function elementIds(block: IdBlock) {
  const custom = block.settings.customIdEnabled && !customIdError(block);
  const base = custom ? block.settings.customId! : block.id;
  const counts = { input: 0, select: 0, checkbox: 0 };
  const fields = block.type === "button" ? [] : block.type === "answer" ? [block.settings.answer] : block.settings.answers;
  return {
    root: base,
    submit: `${base}-for-submit`,
    clear: `${base}-for-clear`,
    fields: fields.map((field) => {
      const kind = field.type === "text" ? "input" : field.type === "single" ? "select" : "checkbox";
      return field.type === "multiple"
        ? field.choices.map((choice) => custom ? `${base}-for-checkbox${++counts.checkbox}` : `${block.id}-${field.id}-${choice.id}`)
        : [custom ? `${base}-for-${kind}${++counts[kind]}` : `${block.id}-${field.id}`];
    }),
  };
}
export function allElementIds(block: IdBlock): string[] {
  const ids = elementIds(block);
  return block.type === "button" ? [ids.root] : [ids.root, ...ids.fields.flat(), ids.submit, ...(block.settings.showClearButton ? [ids.clear] : [])];
}
