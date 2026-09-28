import { useId, useState } from "react";
import styled from "styled-components";
import SettingsPanelHeader from "@/components/editor/SettingsPanelHeader";
import FormSection from "@/components/ui/form/FormSection";
import TextAreaField from "@/components/ui/form/TextAreaField";
import CharacterCounter from "@/components/ui/form/CharacterCounter";

const exampleLimit = 100;
const segmenter = new Intl.Segmenter("ja", {
  granularity: "grapheme",
});

export default function TextExamples() {
  const [text, setText] = useState("");
  const counterId = useId();
  const headingId = useId();

  const count = Array.from(segmenter.segment(text)).length;
  const exceeded = count > exampleLimit;

  return (
    <Panel aria-labelledby={headingId}>
      <SettingsPanelHeader
        id={headingId}
        title="吹出し"
        icon="chat_bubble_outline"
      />

      <FormSection title="内容">
        <TextAreaField
          label="メッセージ"
          helperText={`最大${exampleLimit}文字（部品確認用）`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-describedby={counterId}
          aria-invalid={exceeded || undefined}
        />

        <CharacterCounter
          id={counterId}
          count={count}
          maxLength={exampleLimit}
        />
      </FormSection>
    </Panel>
  );
}

const Panel = styled.section`
  min-width: 0;
  background-color: ${({ theme }) => theme.colors.cloudyWhite};
`;
