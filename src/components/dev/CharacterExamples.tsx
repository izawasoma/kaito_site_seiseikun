import { useState } from "react";
import styled from "styled-components";
import CharacterRegisterDialog from "@/components/editor/characters/CharacterRegisterDialog";
import TextField from "@/components/ui/form/TextField";
import AlertBanner from "@/components/ui/feedback/AlertBanner";
import type { CharacterDraft } from "@/lib/characterStorage";
import CharacterLoadPopover from "@/components/editor/characters/CharacterLoadPopover";

export default function CharacterExamples() {
  const [draft, setDraft] = useState<CharacterDraft>({
    imageUrl: "",
    characterName: "",
  });
  const [error, setError] = useState("");

  return (
    <Container>
      {error && (
        <ErrorArea>
          <AlertBanner message={error} onClose={() => setError("")} />
        </ErrorArea>
      )}

      <Actions>
        <CharacterLoadPopover onSelect={setDraft} onError={setError} />
        <CharacterRegisterDialog draft={draft} onError={setError} />
      </Actions>

      <TextField
        label="画像URL"
        type="url"
        required
        value={draft.imageUrl}
        onChange={(event) =>
          setDraft({ ...draft, imageUrl: event.target.value })
        }
      />

      <TextField
        label="キャラクター名"
        required
        value={draft.characterName}
        onChange={(event) =>
          setDraft({ ...draft, characterName: event.target.value })
        }
      />
    </Container>
  );
}

const Container = styled.section`
  display: grid;
  gap: 12px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
`;

const ErrorArea = styled.div`
  position: fixed;
  inset: 0 0 auto;
  z-index: 300;
`;
