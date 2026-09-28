import { useState } from "react";
import styled from "styled-components";
import Chip from "@/components/ui/chip/Chip";
import Button from "@/components/ui/button/Button";
import FormSection from "@/components/ui/form/FormSection";

const initialCandidates = [
  { id: "candidate-1", label: "いちごいちえ" },
  { id: "candidate-2", label: "一期一会" },
];

export default function ChipExamples() {
  const [candidates, setCandidates] = useState(initialCandidates);

  return (
    <FormSection title="登録した単語" headingLevel={2}>
      <ChipList>
        {candidates.map((candidate) => (
          <Chip
            key={candidate.id}
            label={candidate.label}
            onRemove={() => {
              setCandidates((current) =>
                current.filter((item) => item.id !== candidate.id),
              );
            }}
          />
        ))}
      </ChipList>

      <p role="status">登録数：{candidates.length}件</p>

      <Button onClick={() => setCandidates(initialCandidates)}>
        確認用データを戻す
      </Button>

      <ChipList>
        <Chip label="表示専用" />
        <Chip label="削除できない候補" onRemove={() => {}} disabled />
      </ChipList>
    </FormSection>
  );
}

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
