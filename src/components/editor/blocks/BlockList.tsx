import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import styled from "styled-components";
import BlockListItem from "@/components/editor/blocks/BlockListItem";
import type { ProjectBlock } from "@/types/project";

type BlockListProps = {
  blocks: readonly ProjectBlock[];
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onCopy: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onMove: (movingBlockId: string, destinationBlockId: string) => void;
};

/**
 * プロジェクトの順番で一覧を表示し、各操作を親へ通知する。
 * ドラッグ完了時にだけ並び順を更新する。
 *
 * @param props.blocks - 表示順に並んだブロック一覧。
 * @param props.selectedBlockId - 選択中のブロックID。
 * @param props.onSelect - 選択操作を通知する関数。
 * @param props.onCopy - コピー操作を通知する関数。
 * @param props.onDelete - 削除操作を通知する関数。
 * @param props.onMove - 移動するブロックと移動先のブロックのIDを通知する関数。
 */
export default function BlockList({
  blocks,
  selectedBlockId,
  onSelect,
  onCopy,
  onDelete,
  onMove,
}: BlockListProps) {
  return (
    <DragDropProvider
      onDragEnd={(dragEndEvent) => {
        if (dragEndEvent.canceled) {
          return;
        }

        const draggedItem = dragEndEvent.operation.source;

        if (!isSortable(draggedItem)) {
          return;
        }

        const originalIndex = draggedItem.initialIndex;
        const destinationIndex = draggedItem.index;

        if (originalIndex === destinationIndex) {
          return;
        }

        const movingBlock = blocks[originalIndex];
        const destinationBlock = blocks[destinationIndex];

        if (!movingBlock || !destinationBlock) {
          return;
        }

        onMove(movingBlock.id, destinationBlock.id);
      }}
    >
      <List aria-label="ブロック一覧">
        {blocks.map((projectBlock, blockIndex) => (
          <BlockListItem
            key={projectBlock.id}
            block={projectBlock}
            blockIndex={blockIndex}
            isSelected={projectBlock.id === selectedBlockId}
            onSelect={onSelect}
            onCopy={onCopy}
            onDelete={onDelete}
          />
        ))}
      </List>
    </DragDropProvider>
  );
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
