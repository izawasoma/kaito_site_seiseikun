import { validateBlock } from "@/lib/project/validateProject";
import styled from "styled-components";
import { useSortable } from "@dnd-kit/react/sortable";
import Icon from "@/components/ui/icon/Icon";
import IconButton from "@/components/ui/button/IconButton";
import type { ProjectBlock } from "@/types/project";
import { getImageUrl } from "@/lib/getImageUrl";

const blockAppearances = {
  icon: { label: "アイコンカード", icon: "dashboard" },
  image: { label: "画像", icon: "image" },
  button: { label: "ボタン", icon: "ads_click" },
  answer: { label: "単一回答欄", icon: "list_alt" },
  multiAnswer: { label: "多答回答欄", icon: "checklist" },
  speech: { label: "吹出し", icon: "chat_bubble_outline" },
  title: { label: "タイトル", icon: "title" },
  text: { label: "テキスト", icon: "text_fields" },
};

type BlockListItemProps = {
  block: ProjectBlock;
  blockIndex: number;
  isSelected: boolean;
  onSelect: (blockId: string) => void;
  onCopy: (blockId: string) => void;
  onDelete: (blockId: string) => void;
};

/**
 * ブロック一覧の1行を表示し、ドラッグハンドルを提供する。
 * 選択・コピー・削除は、それぞれ親へIDを通知する。
 *
 * @param props.block - この行に表示するブロック。
 * @param props.blockIndex - 現在の配列上の位置。0から始まる。
 * @param props.isSelected - このブロックが編集対象として選択されているか。
 * @param props.onSelect - 選択操作を通知する関数。
 * @param props.onCopy - コピー操作を通知する関数。
 * @param props.onDelete - 削除操作を通知する関数。
 */
export default function BlockListItem({
  block,
  blockIndex,
  isSelected,
  onSelect,
  onCopy,
  onDelete,
}: BlockListItemProps) {
  const { ref, handleRef } = useSortable({
    id: block.id,
    index: blockIndex,
  });

  const appearance = blockAppearances[block.type];
  const avatarUrl = block.type === "speech" ? getImageUrl(block.settings.imageUrl) : "";
  const blockLabel = block.type === "speech"
    ? `吹出し${block.settings.characterName.trim() ? `_${block.settings.characterName}` : ""}`
    : "text" in block.settings ? block.settings.text.trim() || appearance.label : appearance.label;

  return (
    <Row ref={ref} $selected={isSelected}>
      <DragHandle
        ref={handleRef}
        type="button"
        aria-label={`${blockIndex + 1}番目のブロックを並び替え`}
        title="ドラッグして並び替え"
      >
        <Icon name="drag_indicator" size={20} />
      </DragHandle>

      <SelectButton
        type="button"
        aria-pressed={isSelected}
        aria-label={`${blockIndex + 1}番目：${blockLabel}`}
        title={blockLabel}
        onClick={() => onSelect(block.id)}
      >
        <NumberLabel aria-hidden="true">{blockIndex + 1}</NumberLabel>

        <TypeIcon>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : <Icon name={appearance.icon} size={22} />}
        </TypeIcon>

        <BlockLabel>{blockLabel}</BlockLabel>
        {validateBlock(block).length > 0 && <ErrorMark title="入力内容を確認してください"><Icon name="error" size={18} /></ErrorMark>}
      </SelectButton>

      <RowActions>
        <StyledIconButton
          icon="content_copy"
          label={`${blockIndex + 1}番目のブロックをコピー`}
          onClick={() => onCopy(block.id)}
        />
        <StyledIconButton
          icon="delete_outline"
          label={`${blockIndex + 1}番目のブロックを削除`}
          onClick={() => onDelete(block.id)}
        />
      </RowActions>
    </Row>
  );
}

const NumberLabel = styled.span`
  flex-shrink: 0;
  min-width: 12px;
  font-size: 12px;
  text-align: center;
`;

const AvatarImage = styled.img`
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.white};
`;

const TypeIcon = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.purple};
  color: ${({ theme }) => theme.colors.white};
`;

const BlockLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`;

const Row = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  min-height: 54px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.veryLightGray};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.lightRed : theme.colors.cloudyWhite};

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.lightRed : theme.colors.lightGray};
  }
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  min-height: 54px;
  padding: 10px 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: -2px;
  }
`;

const RowActions = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-right: 6px;
`;

const StyledIconButton = styled(IconButton)`
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

const DragHandle = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 32px;
  margin-left: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGray};
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.deepBlue};
    outline-offset: -2px;
  }
`;

const ErrorMark = styled.span`
  display: inline-flex; flex-shrink: 0; color: ${({ theme }) => theme.colors.red};
`;
