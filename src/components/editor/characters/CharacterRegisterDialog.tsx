import { useState } from "react";
import styled from "styled-components";
import Dialog from "@/components/ui/dialog/Dialog";
import TextField from "@/components/ui/form/TextField";
import Button from "@/components/ui/button/Button";
import {
  loadCharacters,
  hasDuplicateCharacter,
  registerCharacter,
  type CharacterDraft,
} from "@/lib/characterStorage";

type CharacterRegisterDialogProps = {
  draft: CharacterDraft;
  onError: (message: string) => void;
};

export default function CharacterRegisterDialog({
  draft,
  onError,
}: CharacterRegisterDialogProps) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<CharacterDraft>(draft);
  const [registrationName, setRegistrationName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameError =
    submitted && registrationName.trim() === ""
      ? "登録名は必須項目です"
      : undefined;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    if (draft.imageUrl.trim() === "" || draft.characterName.trim() === "") {
      onError("画像URLとキャラクター名を入力してください。");
      return;
    }

    try {
      const characters = loadCharacters();

      if (hasDuplicateCharacter(characters, draft)) {
        onError(
          "既に同じ画像URL・キャラクター名の組み合わせでデータ登録が存在します",
        );
        return;
      }

      setSnapshot({ ...draft });
      setRegistrationName(draft.characterName);
      setSubmitted(false);
      onError("");
      setOpen(true);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "キャラクター情報を読み込めませんでした。",
      );
    }
  }

  function handleSave() {
    setSubmitted(true);

    if (registrationName.trim() === "") return;

    try {
      registerCharacter(snapshot, registrationName);
    } catch (error) {
      setOpen(false);
      onError(
        error instanceof Error
          ? error.message
          : "キャラクター情報を保存できませんでした。",
      );
      return;
    }

    onError("");
    setOpen(false);
  }

  return (
    <Dialog
      triggerLabel="キャラクター登録"
      title="キャラクター登録"
      description="キャラクターをブラウザストレージに保存することで、次回から呼び出しが楽になります。この情報はブラウザ単位で保存されるため、別ページの制作時にも情報が引き継がれます。"
      open={open}
      onOpenChange={handleOpenChange}
      closeButtonGap={6}
    >
      <Content>
        <Fields>
          <TextField label="画像URL" value={snapshot.imageUrl} disabled />

          <TextField
            label="キャラクター名"
            value={snapshot.characterName}
            disabled
          />

          <TextField
            label="登録名"
            required
            value={registrationName}
            onChange={(event) => setRegistrationName(event.target.value)}
            error={nameError}
          />
        </Fields>

        <SaveButton onClick={handleSave}>保存</SaveButton>
      </Content>
    </Dialog>
  );
}

const Content = styled.div`
  display: grid;
  gap: 24px;
`;

const Fields = styled.div`
  display: grid;
  gap: 8px;
`;

const SaveButton = styled(Button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.purple};
`;
