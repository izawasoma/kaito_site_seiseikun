import { useState } from "react";
import styled from "styled-components";
import TextField from "@/components/ui/form/TextField";
import Button from "@/components/ui/button/Button";
import Chip from "@/components/ui/chip/Chip";

type AnswerCandidatesFieldProps = {
  value: readonly string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

export default function AnswerCandidatesField({
  value,
  onChange,
  disabled,
}: AnswerCandidatesFieldProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function registerCandidate() {
    if (disabled) return;

    const candidate = draft.trim();

    if (!candidate) {
      setError("正解候補を入力してください");
      return;
    }

    if (value.includes(candidate)) {
      setError("同じ候補がすでに登録されています");
      return;
    }

    onChange([...value, candidate]);
    setDraft("");
    setError("");
  }

  return (
    <Fields>
      <TextField
        label="正解判定とする語句"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setError("");
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          if (
            event.nativeEvent.isComposing ||
            event.nativeEvent.keyCode === 229
          ) {
            return;
          }

          event.preventDefault();
          registerCandidate();
        }}
        error={error || undefined}
        disabled={disabled}
      />

      <Button onClick={registerCandidate} disabled={disabled}>
        登録
      </Button>

      <Registered>
        <Caption>登録した単語</Caption>
        <ChipList aria-label="登録済みの正解候補">
          {value.map((candidate) => (
            <li key={candidate}>
              <Chip
                label={candidate}
                onRemove={() =>
                  onChange(value.filter((item) => item !== candidate))
                }
                disabled={disabled}
              />
            </li>
          ))}
        </ChipList>
      </Registered>
    </Fields>
  );
}

const Fields = styled.div`
  display: grid;
  gap: 8px;
`;

const Registered = styled.div`
  min-width: 0;
`;

const Caption = styled.p`
  margin: 0 0 4px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 11px;
`;

const ChipList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    min-width: 0;
    max-width: 100%;
  }
`;
