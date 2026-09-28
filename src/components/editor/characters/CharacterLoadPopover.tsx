import { useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import styled from "styled-components";
import Button from "@/components/ui/button/Button";
import IconButton from "@/components/ui/button/IconButton";
import {
  loadCharacters,
  deleteCharacter,
  type CharacterDraft,
  type SavedCharacter,
} from "@/lib/characterStorage";

type CharacterLoadPopoverProps = {
  onSelect: (character: CharacterDraft) => void;
  onError: (message: string) => void;
};

export default function CharacterLoadPopover({
  onSelect,
  onError,
}: CharacterLoadPopoverProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setOpen(false);
      return;
    }

    try {
      setCharacters(loadCharacters());
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

  function handleSelect(character: SavedCharacter) {
    onSelect({
      imageUrl: character.imageUrl,
      characterName: character.characterName,
    });
    setOpen(false);
  }

  function handleDelete(id: string) {
    try {
      const remaining = deleteCharacter(id);

      // 削除されるボタンから、一覧へフォーカスを戻します。
      panelRef.current?.focus();
      setCharacters(remaining);
      onError("");
    } catch (error) {
      setOpen(false);
      onError(
        error instanceof Error
          ? error.message
          : "キャラクター情報を削除できませんでした。",
      );
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button>キャラクター読込</Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Panel
          ref={panelRef}
          side="bottom"
          align="start"
          sideOffset={0}
          collisionPadding={8}
          aria-label="登録済みキャラクター"
          tabIndex={-1}
        >
          {characters.length === 0 ? (
            <EmptyMessage>登録済みキャラクターはありません。</EmptyMessage>
          ) : (
            <List>
              {characters.map((character) => (
                <Row key={character.id}>
                  <SelectButton
                    type="button"
                    title={`${character.characterName} / ${character.imageUrl}`}
                    onClick={() => handleSelect(character)}
                  >
                    {character.characterName}
                  </SelectButton>

                  <IconButton
                    icon="delete_outline"
                    label={`${character.characterName}の登録を削除`}
                    onClick={() => handleDelete(character.id)}
                  />
                </Row>
              ))}
            </List>
          )}
        </Panel>
      </Popover.Portal>
    </Popover.Root>
  );
}

const Panel = styled(Popover.Content)`
  z-index: 100;
  width: 230px;
  max-width: calc(100vw - 16px);
  max-height: min(300px, var(--radix-popover-content-available-height));
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGray};
  box-shadow: 0 2px 3px ${({ theme }) => `${theme.colors.black}33`};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: 1px;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  min-height: 37px;
  padding-right: 4px;
`;

const SelectButton = styled.button`
  flex: 1;
  min-width: 0;
  min-height: 37px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
  text-align: left;
  overflow-wrap: anywhere;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: -2px;
  }
`;

const EmptyMessage = styled.p`
  margin: 0;
  padding: 12px 10px;
  color: ${({ theme }) => theme.colors.gray};
  font-size: 12px;
`;
