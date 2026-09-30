import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import Switch from "@/components/ui/form/Switch";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import AnswerFieldEditor from "./AnswerFieldEditor";
import AnswerCommonFields from "./AnswerCommonFields";
import { createAnswerField } from "@/lib/blocks/createBlock";
import type { AnswerBlock, MultiAnswerBlock } from "@/types/project";

/** 多答の各欄には固定IDを持たせ、編集・並び替え時にも保持する。 */
export default function AnswerSettings({ block, onChange }: {
  block: AnswerBlock | MultiAnswerBlock; onChange: (block: AnswerBlock | MultiAnswerBlock) => void;
}) {
  const answerElements = useRef(new Map<string, HTMLDivElement>());
  const copiedAnswerId = useRef<string | null>(null);

  /** 複製した欄がDOMに追加された後、その見出しまでスクロールする。 */
  useLayoutEffect(() => {
    if (!copiedAnswerId.current) return;
    const element = answerElements.current.get(copiedAnswerId.current);
    copiedAnswerId.current = null;
    element?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
      inline: "nearest",
    });
  }, [block]);

  /** 内容を独立したデータとしてコピーし、元の欄の直後に追加する。 */
  function copyAnswer(index: number) {
    if (block.type !== "multiAnswer") return;
    const copiedAnswer = structuredClone(block.settings.answers[index]);
    copiedAnswer.id = crypto.randomUUID();
    copiedAnswer.choices = copiedAnswer.choices.map((choice) => ({ ...choice, id: crypto.randomUUID() }));
    const answers = [...block.settings.answers];
    answers.splice(index + 1, 0, copiedAnswer);
    copiedAnswerId.current = copiedAnswer.id;
    onChange({ ...block, settings: { ...block.settings, answers } });
  }

  return <>
    <SettingsPanelHeader title={block.type === "answer" ? "単一回答欄" : "多答回答欄"} icon="list_alt" />
    {block.type === "answer" ? <FormSection title="回答設定"><AnswerFieldEditor value={block.settings.answer} onChange={(answer) => onChange({ ...block, settings: { ...block.settings, answer } })} /></FormSection> : <>
      <FormSection title="解答欄を新規で作成する場合、下記ボタンを押して下さい"><Button onClick={() => onChange({ ...block, settings: { ...block.settings, answers: [...block.settings.answers, createAnswerField()] } })}>解答欄を新しく追加</Button></FormSection>
      {block.settings.answers.map((answer, index) => <div key={answer.id} ref={(element) => {
        if (element) answerElements.current.set(answer.id, element);
        else answerElements.current.delete(answer.id);
      }} style={{ scrollMarginTop: 16 }}><FormSection title={`解答欄${index + 1}`}>
        <Actions>
          <IconButton icon="arrow_downward" label="解答欄を下へ" disabled={index === block.settings.answers.length - 1} onClick={() => {
            const answers = [...block.settings.answers];
            [answers[index], answers[index + 1]] = [answers[index + 1], answers[index]];
            onChange({ ...block, settings: { ...block.settings, answers } });
          }} />
          <IconButton icon="arrow_upward" label="解答欄を上へ" disabled={index === 0} onClick={() => {
            const answers = [...block.settings.answers];
            [answers[index], answers[index - 1]] = [answers[index - 1], answers[index]];
            onChange({ ...block, settings: { ...block.settings, answers } });
          }} />
          <IconButton icon="delete_outline" label="解答欄を削除" onClick={() => onChange({ ...block, settings: { ...block.settings, answers: block.settings.answers.filter((field) => field.id !== answer.id) } })} />
          <IconButton icon="content_copy" label="解答欄をコピー" onClick={() => copyAnswer(index)} />
        </Actions>
        <AnswerFieldEditor showLabel value={answer} onChange={(updatedAnswer) => onChange({ ...block, settings: { ...block.settings, answers: block.settings.answers.map((field) => field.id === answer.id ? updatedAnswer : field) } })} />
      </FormSection></div>)}
    </>}
    <FormSection title="全体設定">
      {block.type === "multiAnswer" && <Switch label="個別の判定を表示する" checked={block.settings.showIndividualResults} onChange={(event) => onChange({ ...block, settings: { ...block.settings, showIndividualResults: event.target.checked } })} />}
      <AnswerCommonFields value={block.settings} onChange={(settings) => onChange({ ...block, settings: { ...block.settings, ...settings } } as AnswerBlock | MultiAnswerBlock)} />
    </FormSection>
  </>;
}

const Actions = styled.div`display: flex; justify-content: flex-end; gap: 4px;`;
