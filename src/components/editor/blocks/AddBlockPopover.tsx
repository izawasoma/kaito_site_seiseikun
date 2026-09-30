import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import styled from "styled-components";
import Button from "@/components/ui/button/Button";
import Icon from "@/components/ui/icon/Icon";

const blockOptions = [
  { type: "speech", label: "吹出し", icon: "chat_bubble_outline" },
  { type: "title", label: "タイトル", icon: "title" },
  { type: "text", label: "テキスト", icon: "text_fields" },
  { type: "icon", label: "アイコンカード", icon: "dashboard" },
  { type: "answer", label: "単一回答欄", icon: "list_alt" },
  { type: "multiAnswer", label: "多答回答欄", icon: "checklist" },
  { type: "image", label: "画像", icon: "image" },
  { type: "button", label: "ボタン", icon: "ads_click" },
] as const;

export type BlockType = (typeof blockOptions)[number]["type"];

type AddBlockPopoverProps = {
  onSelect: (blockType: BlockType) => void;
};

/**
 * 新規追加ボタンから、選択したブロックの種類を親へ通知する。
 * 実際のデータ追加は親が担当する。
 */
export default function AddBlockPopover({ onSelect }: AddBlockPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 選択した種類を通知し、追加メニューを閉じる。
   *
   * @param blockType - メニューで選択したブロックの種類。
   */
  function handleSelect(blockType: BlockType) {
    onSelect(blockType);
    setIsOpen(false);
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <AddButton>
          <Icon name="add" size={16} />
          新規追加
        </AddButton>
      </Popover.Trigger>

      <Popover.Portal>
        <Panel
          side="bottom"
          align="start"
          sideOffset={0}
          collisionPadding={8}
          aria-label="追加するブロック"
        >
          <List>
            {blockOptions.map((blockOption) => (
              <li key={blockOption.type}>
                <OptionButton
                  type="button"
                  disabled={blockOption.type !== "title" && blockOption.type !== "text"}
                  onClick={() => handleSelect(blockOption.type)}
                >
                  <Icon name={blockOption.icon} size={20} />
                  <span>{blockOption.label}</span>
                </OptionButton>
              </li>
            ))}
          </List>
        </Panel>
      </Popover.Portal>
    </Popover.Root>
  );
}

const AddButton = styled(Button)`
  width: 100%;
  gap: 2px;
  background-color: ${({ theme }) => theme.colors.purple};
`;

const Panel = styled(Popover.Content)`
  z-index: 100;
  width: var(--radix-popover-trigger-width);
  max-height: min(320px, var(--radix-popover-content-available-height));
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGray};
  box-shadow: 0 2px 3px ${({ theme }) => `${theme.colors.black}33`};
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 37px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: -2px;
  }
`;
