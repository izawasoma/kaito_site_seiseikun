import styled from "styled-components";
import { useSortable } from "@dnd-kit/react/sortable";
import Icon from "@/components/ui/icon/Icon";
import IconButton from "@/components/ui/button/IconButton";
import type { ProjectBlock } from "@/types/project";

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

  const typeLabel = block.type === "title" ? "タイトル" : "テキスト";
  const typeIcon = block.type === "title" ? "title" : "text_fields";
  const blockLabel = block.settings.text.trim() || typeLabel;

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
          <Icon name={typeIcon} size={22} />
        </TypeIcon>

        <BlockLabel>{blockLabel}</BlockLabel>
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
